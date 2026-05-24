"use client";

export interface GuestReportRecoverySnapshot {
  id: string;
  title: string;
  mode: "draft_from_materials" | "start_from_zero";
  selectedModel: "peregrine" | "obsidian" | "zephyr";
  mainText: string;
  timestamp: number;
  status: "draft_ready" | "generation_failed" | "chat_updated" | "autosaved_draft";
  reportTemplate?: string;
  location?: string;
  sourceUrls?: string;
  fileDescription?: string;
  integrityConsent?: boolean;
  [key: string]: any; // Allow indexing to safely inspect and strip dynamic keys
}

const STORAGE_KEY = "nali-recovery-snapshots";
const MAX_ENTRIES = 3;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function safeStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__nali_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeRecoverySnapshot(input: Partial<GuestReportRecoverySnapshot>): GuestReportRecoverySnapshot {
  const safeId = String(input.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/<[^>]*>/g, "");
  const safeTitle = String(input.title || "Draft Laporan").replace(/<[^>]*>/g, "").slice(0, 100);
  const safeMode = input.mode === "start_from_zero" ? "start_from_zero" : "draft_from_materials";
  const safeModel = (input.selectedModel === "obsidian" || input.selectedModel === "zephyr") 
    ? input.selectedModel 
    : "peregrine";

  // Limit mainText to 5000 chars and strip HTML
  let rawText = typeof input.mainText === "string" ? input.mainText : "";
  const safeMainText = rawText.replace(/<[^>]*>/g, "").slice(0, 5000);

  const safeSnapshot: GuestReportRecoverySnapshot = {
    id: safeId,
    title: safeTitle,
    mode: safeMode,
    selectedModel: safeModel,
    mainText: safeMainText,
    timestamp: typeof input.timestamp === "number" ? input.timestamp : Date.now(),
    status: (input.status === "generation_failed" || input.status === "chat_updated" || input.status === "autosaved_draft") 
      ? input.status 
      : "draft_ready",
    integrityConsent: Boolean(input.integrityConsent),
  };

  if (typeof input.reportTemplate === "string") {
    safeSnapshot.reportTemplate = input.reportTemplate.replace(/<[^>]*>/g, "").slice(0, 100);
  }
  if (typeof input.location === "string") {
    safeSnapshot.location = input.location.replace(/<[^>]*>/g, "").slice(0, 100);
  }
  if (typeof input.sourceUrls === "string") {
    safeSnapshot.sourceUrls = input.sourceUrls.replace(/<[^>]*>/g, "").slice(0, 1000);
  }
  if (typeof input.fileDescription === "string") {
    safeSnapshot.fileDescription = input.fileDescription.replace(/<[^>]*>/g, "").slice(0, 200);
  }

  return safeSnapshot;
}

export function stripForbiddenFields(snapshot: any): any {
  if (!snapshot || typeof snapshot !== "object") return snapshot;

  const forbiddenKeys = [
    "report_access_token_hash",
    "reportAccessTokenHash",
    "apikey",
    "apikeyhash",
    "provider",
    "serverkey",
    "stack",
    "payment",
    "payment_token",
    "transaction",
    "midtrans",
    "token",
    "accesskey",
  ];

  const clean = { ...snapshot };
  for (const key of Object.keys(clean)) {
    const lowerKey = key.toLowerCase();
    if (forbiddenKeys.some((fk) => lowerKey.includes(fk))) {
      delete clean[key];
    }
  }

  return clean;
}

export function listGuestReportRecoveries(): GuestReportRecoverySnapshot[] {
  if (!safeStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter, validate, and prune expired
    const now = Date.now();
    return parsed
      .map((entry) => sanitizeRecoverySnapshot(stripForbiddenFields(entry)))
      .filter((entry) => now - entry.timestamp < TTL_MS);
  } catch {
    return [];
  }
}

export function saveGuestReportRecovery(snapshot: Partial<GuestReportRecoverySnapshot>): boolean {
  if (!safeStorageAvailable()) return false;

  try {
    const cleanSnapshot = sanitizeRecoverySnapshot(stripForbiddenFields(snapshot));
    let list = listGuestReportRecoveries();

    // Remove existing with same ID
    list = list.filter((item) => item.id !== cleanSnapshot.id);

    // Add at beginning
    list.unshift(cleanSnapshot);

    // Limit size
    list = list.slice(0, MAX_ENTRIES);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    // Handle storage quota error gracefully without throwing
    console.warn("NaLI local browser recovery write failed: storage quota exceeded or blocked", err);
    return false;
  }
}

export function loadLatestGuestReportRecovery(): GuestReportRecoverySnapshot | null {
  const list = listGuestReportRecoveries();
  return list.length > 0 ? list[0] : null;
}

export function clearGuestReportRecovery(id?: string): void {
  if (!safeStorageAvailable()) return;

  try {
    if (id) {
      let list = listGuestReportRecoveries();
      list = list.filter((item) => item.id !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function pruneExpiredGuestRecoveries(): void {
  if (!safeStorageAvailable()) return;

  try {
    const list = listGuestReportRecoveries(); // This automatically filters out expired entries
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function renameGuestReportRecovery(id: string, title: string): boolean {
  if (!safeStorageAvailable()) return false;

  try {
    let cleanTitle = typeof title === "string" ? title : "";
    // Sanitize HTML
    cleanTitle = cleanTitle.replace(/<[^>]*>/g, "");

    // Sanitize tokens, api keys, provider names, payment systems, stack traces, paths, etc.
    cleanTitle = cleanTitle
      .replace(/sk-[a-zA-Z0-9_-]{12,}/gi, "")
      .replace(/[a-zA-Z0-9_-]{32,}/g, "")
      .replace(/(openrouter|supabase|midtrans|openai|claude|gpt|gemini|token|access_key|access-key|apikey|hash|secret|payment|transaction|fulfillment)/gi, "")
      .replace(/at\s+[\w\d\s\.\\\/:\(\)-]+:\d+:\d+/gi, "")
      .replace(/stack|trace|error/gi, "")
      .replace(/\/Users\/[\w\d\s\.\\\/:-]+/gi, "")
      .replace(/[a-zA-Z]:\\[\w\d\s\.\\\/:-]+/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanTitle) {
      cleanTitle = "Draft Laporan Tanpa Judul";
    }

    // Clamp length at 80 characters
    cleanTitle = cleanTitle.slice(0, 80);

    let list = listGuestReportRecoveries();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;

    list[index].title = cleanTitle;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function getGuestReportRecoveryById(id: string): GuestReportRecoverySnapshot | null {
  try {
    const list = listGuestReportRecoveries();
    return list.find((item) => item.id === id) || null;
  } catch {
    return null;
  }
}

export function clearExpiredGuestRecoveries(): void {
  pruneExpiredGuestRecoveries();
}

export function getGuestRecoveryStats(): { count: number; storageBytes: number } {
  if (!safeStorageAvailable()) return { count: 0, storageBytes: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || "[]";
    const list = listGuestReportRecoveries();
    const bytes = typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(raw).length
      : raw.length;
    return {
      count: list.length,
      storageBytes: bytes,
    };
  } catch {
    return { count: 0, storageBytes: 0 };
  }
}

export function clearAutosaveOnly(): void {
  clearGuestReportRecovery("composer-autosave");
}
