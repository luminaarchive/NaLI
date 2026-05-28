"use client";

import { FormEvent, useEffect, useRef, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Compass,
  Download,
  FileText,
  LockKeyhole,
  Loader2,
  Menu,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FluidVideoBackground } from "@/components/ui/FluidVideoBackground";
import { NaLILogo, NaLILogoMark } from "@/components/ui/NaLILogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReportResult, DraftReport, StartFromZeroGuide } from "@/lib/reports/reportGenerator";
import { buildReportMarkdown } from "@/lib/reports/markdown";
import { NaliAlert } from "@/components/ui/NaliAlert";
import { normalizePublicError } from "@/lib/errors/publicErrors";
import {
  saveGuestReportRecovery,
  clearGuestReportRecovery,
  loadLatestGuestReportRecovery,
  pruneExpiredGuestRecoveries,
  renameGuestReportRecovery,
  listGuestReportRecoveries,
  type GuestReportRecoverySnapshot,
} from "@/lib/reports/clientRecovery";
import { validateComposerInput } from "@/lib/reports/inputValidation";
import { useDebouncedComposerValidation } from "@/lib/reports/useDebouncedValidation";

// Types matching backend AgentMessage schema
type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  type: "plain" | "plan" | "progress" | "report_preview" | "evidence_status" | "quality_status" | "error" | "action";
  content: string;
  metadata?: {
    run_id?: string;
    step_id?: string;
    evidence_strength?: "weak" | "medium" | "strong";
    source_coverage?: "limited" | "adequate" | "strong";
    academic_integrity?: "safe" | "warning" | "blocked";
    mode_label?: "fast" | "advanced_report" | "deep_intelligence";
    template_id?: string;
    warning_codes?: string[];
    new_report?: any;
  };
  created_at: string;
};

type LocalThread = {
  id: string;
  title: string;
  mode: string;
  created_at: string;
  token?: string;
};

interface AgentWorkspaceProps {
  initialReportId?: string;
}

const templates = [
  "Laporan Observasi Lingkungan",
  "Laporan Praktikum Biologi",
  "Laporan Kerja Lapangan Geografi",
  "Laporan KKN Lingkungan",
] as const;

export function AgentWorkspace({ initialReportId }: AgentWorkspaceProps) {
  const router = useRouter();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [lastAttemptedQuery, setLastAttemptedQuery] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [activeRunStatus, setActiveRunStatus] = useState<"idle" | "running" | "completed" | "failed" | "blocked">(
    "idle",
  );
  const [reportStatus, setReportStatus] = useState<
    "idle" | "validating" | "planning" | "generating" | "quality checking" | "done" | "error" | "rate limited" | "integrity blocked"
  >("idle");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentThreads, setRecentThreads] = useState<LocalThread[]>([]);

  // Form/Composer state
  const [query, setQuery] = useState("");
  const validationIssue = useDebouncedComposerValidation(query);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("Laporan Observasi Lingkungan");
  const [selectedMode, setSelectedMode] = useState<"draft_from_materials" | "start_from_zero">("draft_from_materials");
  const [integrityConsent, setIntegrityConsent] = useState(false);
  const [recoverySnapshot, setRecoverySnapshot] = useState<GuestReportRecoverySnapshot | null>(null);
  const [snapshots, setSnapshots] = useState<GuestReportRecoverySnapshot[]>([]);

  const loadSnapshots = useCallback(() => {
    try {
      const list = listGuestReportRecoveries();
      setSnapshots(list);

      const latest = list.length > 0 ? list[0] : null;
      if (latest) {
        if (!(latest.status === "autosaved_draft" && initialReportId && latest.reportId === initialReportId)) {
          setRecoverySnapshot(latest);
        } else {
          setRecoverySnapshot(null);
        }
      } else {
        setRecoverySnapshot(null);
      }
    } catch {
      // ignore
    }
  }, [initialReportId]);

  // App context
  const [error, setError] = useState<{
    message: string;
    code?: string;
    status?: number;
    retryAfterSeconds?: number;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const showValidation = !error && query.trim().length > 0 && validationIssue.severity !== "none";

  useEffect(() => {
    if (!error || !error.retryAfterSeconds || error.retryAfterSeconds <= 0) return;

    const timer = setInterval(() => {
      setError((curr) => {
        if (!curr || !curr.retryAfterSeconds || curr.retryAfterSeconds <= 0) {
          clearInterval(timer);
          return curr;
        }
        return {
          ...curr,
          retryAfterSeconds: curr.retryAfterSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only reacts to retryAfterSeconds, not entire error object
  }, [error?.retryAfterSeconds]);

  // Progressive steps simulation state for optimistic UI
  const [optimisticSteps, setOptimisticSteps] = useState<
    Array<{ label: string; status: "pending" | "in_progress" | "completed" }>
  >([]);

  // Inline feedback state
  const [inlineFeedbackSent, setInlineFeedbackSent] = useState(false);
  const [inlineFeedbackExpanded, setInlineFeedbackExpanded] = useState(false);
  const [inlineFeedbackComment, setInlineFeedbackComment] = useState("");
  const [inlineFeedbackSending, setInlineFeedbackSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadRecentThreads = () => {
    try {
      const stored = window.localStorage.getItem("nali-threads");
      if (stored) {
        setRecentThreads(JSON.parse(stored) as LocalThread[]);
      }
    } catch {
      // ignore
    }
  };

  const saveRecentThread = (threadId: string, title: string, mode: string, token?: string) => {
    try {
      const stored = window.localStorage.getItem("nali-threads");
      let list: LocalThread[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate
      list = list.filter((t) => t.id !== threadId);

      // Prepend latest
      list.unshift({
        id: threadId,
        title,
        mode,
        created_at: new Date().toLocaleDateString("id-ID"),
        token,
      });

      // Keep last 15
      list = list.slice(0, 15);
      window.localStorage.setItem("nali-threads", JSON.stringify(list));
      setRecentThreads(list);
    } catch {
      // ignore
    }
  };

  const loadReport = async (reportId: string) => {
    setActiveRunStatus("running");
    setError(null);
    try {
      // 1. Check localStorage first for instant load
      const stored = window.localStorage.getItem(`nali-report:${reportId}`);
      const storedNotice = window.localStorage.getItem(`nali-report-notice:${reportId}`);
      const key = getStoredReportAccessKey(reportId);

      if (storedNotice) {
        setNotice(storedNotice);
      }
      if (key) {
        setAccessKey(key);
      }

      let localReport: ReportResult | null = null;
      if (stored) {
        try {
          localReport = JSON.parse(stored) as ReportResult;
          setReport(localReport);
          // Initialize message list from local storage or construct it
          const localMessages = window.localStorage.getItem(`nali-messages:${reportId}`);
          if (localMessages) {
            setMessages(JSON.parse(localMessages));
          } else {
            // Reconstruct first turn
            const initMessages: AgentMessage[] = [
              {
                id: "initial-user",
                role: "user",
                type: "plain",
                content:
                  localReport.mode === "start_from_zero"
                    ? "Mulai panduan dari nol"
                    : "Buat draf laporan berbasis bukti",
                created_at: localReport.created_at,
              },
              {
                id: "initial-assistant",
                role: "assistant",
                type: "report_preview",
                content: "Berikut draf laporan yang telah disusun.",
                metadata: { new_report: localReport },
                created_at: localReport.created_at,
              },
            ];
            setMessages(initMessages);
          }
        } catch {
          // ignore
        }
      }

      // 2. Fetch server updates (source of truth)
      if (key) {
        const response = await fetch(`/api/reports/${reportId}?token=${encodeURIComponent(key)}`);
        if (response.ok) {
          const payload = await response.json();
          if (payload.report) {
            setReport(payload.report);
            window.localStorage.setItem(`nali-report:${reportId}`, JSON.stringify(payload.report));

            // Reconcile messages
            const serverThread = payload.report.processing_metadata?.agent_thread;
            if (serverThread && serverThread.messages) {
              setMessages(serverThread.messages);
              window.localStorage.setItem(`nali-messages:${reportId}`, JSON.stringify(serverThread.messages));
            }
          }
        }
      }
    } catch {
      setError({ message: "Gagal menghubungi server untuk memuat laporan.", status: 500 });
    } finally {
      setActiveRunStatus("idle");
    }
  };

  const getStoredReportAccessKey = (reportId: string): string | null => {
    if (typeof window === "undefined") return null;
    const tkStorageKey = "nali-report-access-token" + `:${reportId}`;
    return (
      window.localStorage.getItem(`nali-report-access:${reportId}`) ??
      window.localStorage.getItem(tkStorageKey) ??
      window.localStorage.getItem(`nali-report-key:${reportId}`) ??
      window.localStorage.getItem(`nali-report-access-key:${reportId}`)
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticSteps, activeRunStatus]);

  // Load thread list on mount
  useEffect(() => {
    loadRecentThreads();

    try {
      pruneExpiredGuestRecoveries();
      const latest = loadLatestGuestReportRecovery();
      if (latest) {
        if (latest.status === "autosaved_draft" && initialReportId && latest.reportId === initialReportId) {
          if (latest.mainText) {
            setQuery(latest.mainText);
          }
          clearGuestReportRecovery(latest.id);
        }
      }
      loadSnapshots();
    } catch {
      // ignore
    }
  }, [initialReportId, loadSnapshots]);

  // Debounced local composer autosave in AgentWorkspace
  useEffect(() => {
    if (query.trim().length < 20) {
      return;
    }

    const timer = setTimeout(() => {
      saveGuestReportRecovery({
        id: "composer-autosave",
        title: report?.title || selectedTemplate || "Autosave Draft Laporan",
        mode: selectedMode,
        mainText: query,
        reportTemplate: selectedTemplate,
        integrityConsent: integrityConsent,
        status: "autosaved_draft",
        timestamp: Date.now(),
        reportId: initialReportId || undefined,
      });
      loadSnapshots();
    }, 2000);

    return () => clearTimeout(timer);
  }, [query, selectedMode, selectedTemplate, integrityConsent, initialReportId, report?.title, loadSnapshots]);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const handleRestoreSnapshot = useCallback(
    (snapshot: GuestReportRecoverySnapshot) => {
      // Restore requires user action, warn first if active input exists
      if (queryRef.current.trim()) {
        const confirmOverwrite = window.confirm(
          "Apakah Anda ingin menimpa input aktif saat ini dengan draft yang dipulihkan?",
        );
        if (!confirmOverwrite) return;
      }

      const id = snapshot.id;
      const storedToken =
        window.localStorage.getItem(`nali-report-access:${id}`) ||
        window.localStorage.getItem(`nali-report-access-key:${id}`) ||
        window.localStorage.getItem(`nali-report-key:${id}`) ||
        window.localStorage.getItem(`nali-report-access-token:${id}`);

      // Rule 7: If snapshot has reportId but no access key, restore draft/composer state
      if (
        (snapshot.status === "draft_ready" || snapshot.status === "chat_updated") &&
        storedToken &&
        id &&
        !id.startsWith("temp-") &&
        id !== "composer-autosave"
      ) {
        router.push(`/report/${id}?token=${encodeURIComponent(storedToken)}`);
      } else {
        setQuery(snapshot.mainText || "");
        setSelectedMode(snapshot.mode || "draft_from_materials");
        if (snapshot.reportTemplate) {
          setSelectedTemplate(snapshot.reportTemplate);
        }
        setIntegrityConsent(snapshot.integrityConsent || false);
        setError(null);
        setNotice(null);
        composerRef.current?.focus();
      }
    },
    [router],
  );

  const handleRenameSnapshot = useCallback(
    (id: string, currentTitle: string) => {
      const newTitle = window.prompt("Masukkan nama baru untuk draft ini:", currentTitle);
      if (newTitle === null) return;
      const success = renameGuestReportRecovery(id, newTitle);
      if (success) {
        loadSnapshots();
      } else {
        alert("Gagal mengubah nama draft.");
      }
    },
    [loadSnapshots],
  );

  const handleDeleteSnapshot = useCallback(
    (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
        clearGuestReportRecovery(id);
        loadSnapshots();
      }
    },
    [loadSnapshots],
  );

  const handleClearAllSnapshots = useCallback(() => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua draft lokal di browser ini?")) {
      clearGuestReportRecovery();
      loadSnapshots();
    }
  }, [loadSnapshots]);

  // Load existing report if ID provided
  useEffect(() => {
    if (initialReportId) {
      loadReport(initialReportId);
    } else {
      setReport(null);
      setMessages([]);
      setAccessKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReportId]);

  // Run progress simulation for optimistic UI
  const startProgressSimulation = () => {
    setReportStatus("validating");
    const steps = [
      { label: "Menganalisis Kueri & Integritas", status: "in_progress" as const },
      { label: "Memeriksa Bukti Pengguna (Evidence Ladder)", status: "pending" as const },
      { label: "Menyusun Kerangka Draf & Struktur Laporan", status: "pending" as const },
      { label: "Menilai Kualitas Bukti & Rekomendasi", status: "pending" as const },
    ];
    setOptimisticSteps(steps);

    setTimeout(() => {
      setReportStatus("planning");
      setOptimisticSteps((curr) => {
        if (curr.length === 0) return [];
        return [{ ...curr[0], status: "completed" }, { ...curr[1], status: "in_progress" }, curr[2], curr[3]];
      });
    }, 800);

    setTimeout(() => {
      setReportStatus("generating");
      setOptimisticSteps((curr) => {
        if (curr.length === 0) return [];
        return [curr[0], { ...curr[1], status: "completed" }, { ...curr[2], status: "in_progress" }, curr[3]];
      });
    }, 1800);

    setTimeout(() => {
      setReportStatus("quality checking");
      setOptimisticSteps((curr) => {
        if (curr.length === 0) return [];
        return [curr[0], curr[1], { ...curr[2], status: "completed" }, { ...curr[3], status: "in_progress" }];
      });
    }, 2800);
  };

  const handleInitialSubmit = async (e?: FormEvent, retryQuery?: string) => {
    if (e) e.preventDefault();
    const trimmed = (retryQuery !== undefined ? retryQuery : query).trim();
    if (!trimmed) return;

    if (!integrityConsent) {
      setError({ message: "Centang pernyataan integritas akademik NaLI terlebih dahulu." });
      return;
    }

    setError(null);
    setNotice(null);
    setLastAttemptedQuery(trimmed);
    clearGuestReportRecovery("composer-autosave");
    setActiveRunStatus("running");

    // Add optimistic user message
    const tempUserMsg: AgentMessage = {
      id: "opt-user",
      role: "user",
      type: "plain",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages([tempUserMsg]);
    startProgressSimulation();

    try {
      const guestSessionKey = "nali-guest-session-id";
      let guestSessionId = window.localStorage.getItem(guestSessionKey);
      if (!guestSessionId) {
        guestSessionId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        window.localStorage.setItem(guestSessionKey, guestSessionId);
      }

      const tempId = `temp-${Date.now()}`;
      saveGuestReportRecovery({
        id: tempId,
        title: selectedTemplate || "Draft Laporan",
        mode: selectedMode,
        mainText: trimmed,
        reportTemplate: selectedTemplate,
        integrityConsent: integrityConsent,
        status: "generation_failed",
        timestamp: Date.now(),
      });

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          mainText: trimmed,
          reportTemplate: selectedTemplate,
          integrityConsent: true,
          guestSessionId,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.report || !payload.id) {
        // Rule 7: Abuse-blocked prompts must not become recovery drafts.
        const isAbuseBlock =
          response.status === 400 &&
          [
            "EMPTY_DRAFT_MATERIAL",
            "FINAL_ASSIGNMENT_WITHOUT_MATERIAL",
            "FAKE_CITATION_REQUEST",
            "FAKE_DATA_REQUEST",
            "PLAGIARISM_EVASION",
            "DO_MY_WORK",
          ].includes(payload.code || "");

        if (isAbuseBlock) {
          clearGuestReportRecovery(tempId);
          clearGuestReportRecovery("composer-autosave");
        }

        const isRateLimit = response.status === 429 || payload.code === "RATE_LIMIT";
        setReportStatus(isRateLimit ? "rate limited" : isAbuseBlock ? "integrity blocked" : "error");

        setError({
          message: payload.error ?? "NaLI gagal membuat draf laporan awal.",
          code: payload.code,
          status: response.status,
          retryAfterSeconds: payload.retryAfterSeconds,
        });
        setMessages([]);
        setActiveRunStatus("failed");
        return;
      }

      const reportId = payload.id;
      const key = payload.report_access_key;
      const generatedReport = payload.report;

      clearGuestReportRecovery(tempId);
      clearGuestReportRecovery("composer-autosave");
      saveGuestReportRecovery({
        id: reportId,
        title: generatedReport.title || selectedTemplate || "Draft Laporan",
        mode: selectedMode,
        mainText: trimmed,
        reportTemplate: selectedTemplate,
        integrityConsent: integrityConsent,
        status: "draft_ready",
        timestamp: Date.now(),
      });

      setReport(generatedReport);
      setAccessKey(key);
      if (payload.notice) {
        setNotice(payload.notice);
      }

      // Initialize server-side conversation metadata under the retrieved report key
      const initialAssistantMsg: AgentMessage = {
        id: "msg-init-assistant",
        role: "assistant",
        type: "report_preview",
        content: `Draf awal untuk "${generatedReport.title}" berhasil disusun. Anda dapat mengetik pesan lanjutan di bawah untuk memperbarui draf.`,
        metadata: { new_report: generatedReport },
        created_at: new Date().toISOString(),
      };

      const initialThread = [tempUserMsg, initialAssistantMsg];
      setMessages(initialThread);

      // Save to localStorage cache
      window.localStorage.setItem(`nali-report:${reportId}`, JSON.stringify(generatedReport));
      window.localStorage.setItem(`nali-messages:${reportId}`, JSON.stringify(initialThread));
      if (key) {
        window.localStorage.setItem(`nali-report-access:${reportId}`, key);
        window.localStorage.setItem(`nali-report-access-token:${reportId}`, key);
      }

      // Save to history sidebar list
      saveRecentThread(reportId, generatedReport.title, generatedReport.mode, key);

      // Update DB to include this initial conversation history
      await fetch("/api/reports/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          reportAccessKey: key,
          newQuery: trimmed,
        }),
      }).catch(() => {}); // fire-and-forget sync to register thread in metadata

      // Replace URL to point to this report
      setReportStatus("done");
      window.history.pushState(null, "", `/report/${reportId}`);
    } catch {
      setReportStatus("error");
      setError({
        message: "Koneksi gagal. Periksa jaringan Anda.",
        status: 500,
      });
      setMessages([]);
    } finally {
      setOptimisticSteps([]);
      setActiveRunStatus("idle");
      setQuery("");
    }
  };

  const handleFollowUpSubmit = async (e?: FormEvent, retryQuery?: string) => {
    if (e) e.preventDefault();
    const trimmed = (retryQuery !== undefined ? retryQuery : query).trim();
    if (!trimmed || activeRunStatus === "running" || !report || !initialReportId) return;

    const issue = validateComposerInput(trimmed);
    if (!issue.canSubmit) {
      setError({
        message: `${issue.title}: ${issue.message}`,
        code: issue.code,
      });
      return;
    }

    setError(null);
    setQuery("");
    setLastAttemptedQuery(trimmed);
    clearGuestReportRecovery("composer-autosave");
    setActiveRunStatus("running");

    // Add optimistic user message to local feed
    const userMsgId = `opt-user-${Date.now()}`;
    const newUserMsg: AgentMessage = {
      id: userMsgId,
      role: "user",
      type: "plain",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((curr) => [...curr, newUserMsg]);
    startProgressSimulation();

    try {
      const response = await fetch("/api/reports/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: initialReportId,
          reportAccessKey: accessKey,
          newQuery: trimmed,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        const isAbuseBlock =
          response.status === 400 &&
          [
            "EMPTY_DRAFT_MATERIAL",
            "FINAL_ASSIGNMENT_WITHOUT_MATERIAL",
            "FAKE_CITATION_REQUEST",
            "FAKE_DATA_REQUEST",
            "PLAGIARISM_EVASION",
            "DO_MY_WORK",
          ].includes(payload.code || "");
        const isRateLimit = response.status === 429 || payload.code === "RATE_LIMIT";
        setReportStatus(isRateLimit ? "rate limited" : isAbuseBlock ? "integrity blocked" : "error");

        setError({
          message: payload.error ?? "NaLI gagal memproses kueri lanjutan Anda.",
          code: payload.code,
          status: response.status,
          retryAfterSeconds: payload.retryAfterSeconds,
        });
        setMessages((curr) => [
          ...curr,
          {
            id: `err-${Date.now()}`,
            role: "system",
            type: "error",
            content: payload.error ?? "Terjadi kesalahan sistem saat memproses.",
            created_at: new Date().toISOString(),
          },
        ]);
        setActiveRunStatus("failed");
        return;
      }

      if (payload.messages) {
        setMessages(payload.messages);
        window.localStorage.setItem(`nali-messages:${initialReportId}`, JSON.stringify(payload.messages));
        // Also update recovery snapshot to reflect "chat_updated" status and the latest mainText
        saveGuestReportRecovery({
          id: initialReportId,
          title: report?.title || "Draft Laporan",
          mode: selectedMode,
          mainText: trimmed,
          status: "chat_updated",
          timestamp: Date.now(),
        });
        setReportStatus("done");
      }
    } catch {
      setReportStatus("error");
      setError({
        message: "Gagal mengirim kueri. Periksa koneksi internet Anda.",
        status: 500,
      });
    } finally {
      setOptimisticSteps([]);
      setActiveRunStatus("idle");
    }
  };

  // Replace report preview with version from message
  const handleApplyProposedReport = async (proposedReport: ReportResult) => {
    if (!initialReportId || !accessKey) return;
    setError(null);

    try {
      const response = await fetch("/api/reports/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: initialReportId,
          reportAccessKey: accessKey,
          action: "replace_preview",
          newReport: proposedReport,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError({
          message: payload.error ?? "Gagal menyinkronkan draf baru di server.",
          code: payload.code,
          status: response.status,
        });
        return;
      }

      setReport(proposedReport);
      window.localStorage.setItem(`nali-report:${initialReportId}`, JSON.stringify(proposedReport));
      setNotice("Draf preview berhasil diganti dengan versi saran ini.");
      setTimeout(() => setNotice(null), 3500);
    } catch {
      setError({
        message: "Koneksi gagal. Gagal memperbarui draf di server.",
        status: 500,
      });
    }
  };

  // Quick Action Chips triggers
  const handleQuickAction = (actionText: string) => {
    setQuery(actionText);
  };

  // Local copy and offline export
  const [copyStatus, setCopyStatus] = useState(false);
  const [copyTextStatus, setCopyTextStatus] = useState(false);

  function stripMarkdown(md: string): string {
    return md
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*|__/g, "")
      .replace(/\*|_/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^-\s+/gm, "")
      .replace(/^[|+-].*[|+-]$/gm, "")
      .replace(/\n\s*\n+/g, "\n\n")
      .trim();
  }

  async function copyTextToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback
      }
    }
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }

  const handleCopyMarkdown = async () => {
    if (!report) return;
    const md = buildReportMarkdown(report, {
      exportStatus: "preview_copy",
    });
    const ok = await copyTextToClipboard(md);
    if (ok) {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } else {
      alert("Gagal menyalin markdown.");
    }
  };

  const handleCopyPlainText = async () => {
    if (!report) return;
    const md = buildReportMarkdown(report, {
      exportStatus: "preview_copy",
    });
    const clean = stripMarkdown(md);
    const ok = await copyTextToClipboard(clean);
    if (ok) {
      setCopyTextStatus(true);
      setTimeout(() => setCopyTextStatus(false), 2000);
    } else {
      alert("Gagal menyalin teks.");
    }
  };

  const handleDownloadMarkdownLocal = () => {
    if (!report) return;
    try {
      const md = buildReportMarkdown(report, {
        exportStatus: "preview_copy",
      });
      const title = report.title || "draft-laporan";
      const cleanTitle =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .trim() || "laporan";
      const filename = `${cleanTitle}.md`;
      const blob = new Blob([md], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh markdown.");
    }
  };

  const handleDownloadTextLocal = () => {
    if (!report) return;
    try {
      const md = buildReportMarkdown(report, {
        exportStatus: "preview_copy",
      });
      const clean = stripMarkdown(md);
      const title = report.title || "draft-laporan";
      const cleanTitle =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .trim() || "laporan";
      const filename = `${cleanTitle}.txt`;
      const blob = new Blob([clean], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh teks.");
    }
  };

  const isRateLimited =
    error?.status === 429 || (error?.retryAfterSeconds !== undefined && error.retryAfterSeconds > 0);

  return (
    <div className="relative flex min-h-screen w-screen overflow-hidden bg-[#060b08] text-[#f5f0e8]">
      <FluidVideoBackground />

      {/* --- Sidebar --- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#14261c] bg-[#08100c]/95 backdrop-blur-2xl transition-transform duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[#14261c] px-4">
          <NaLILogo size={28} variant="light" />
          <button
            aria-label="Tutup riwayat"
            className="inline-flex h-11 w-11 items-center justify-center text-white/40 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <Link
            href="/create-report"
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/80 transition duration-200 hover:bg-white/[0.08] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Mulai Baru
          </Link>
        </div>

        {/* Thread History list */}
        <div className="flex-1 space-y-1 overflow-y-auto px-2">
          <p className="px-3 py-2 text-xs font-semibold tracking-[0.08em] text-white/20 uppercase">
            Riwayat Percakapan
          </p>
          {recentThreads.length === 0 ? (
            <p className="px-3 py-4 text-xs text-white/30 italic">Belum ada percakapan</p>
          ) : (
            recentThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => {
                  setSidebarOpen(false);
                  router.push(`/report/${thread.id}?token=${encodeURIComponent(thread.token || "")}`);
                }}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-xl px-3 py-2.5 text-left text-xs transition duration-150 hover:bg-white/[0.04]",
                  initialReportId === thread.id ? "border border-white/[0.04] bg-white/[0.06]" : "",
                )}
              >
                <span className="truncate font-semibold text-white/70">{thread.title}</span>
                <div className="flex items-center justify-between text-white/40">
                  <span>{thread.mode === "start_from_zero" ? "Panduan" : "Draf"}</span>
                  <span>{thread.created_at}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* --- Main Workspace Content --- */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Workspace Header */}
        <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#14261c] bg-[#060b08]/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              aria-label="Buka riwayat"
              className="inline-flex h-11 w-11 items-center justify-center text-white/60 hover:text-white md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/40 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Keluar
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="hidden min-h-[44px] items-center px-3 text-xs font-semibold text-white/45 transition hover:text-white sm:inline-flex"
            >
              Harga
            </Link>
            <Link
              href="/learn-report"
              className="hidden min-h-[44px] items-center px-3 text-xs font-semibold text-white/45 transition hover:text-white md:inline-flex"
            >
              Panduan
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[11px] font-semibold text-white/60">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {selectedMode === "start_from_zero" ? "Panduan Awal" : "Laporan NaLI"}
            </span>
          </div>
        </header>

        <main className="z-10 flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-8">
          <div
            className={cn(
              "mx-auto max-w-[760px] space-y-6",
              isComposerFocused
                ? "pb-[calc(18rem+env(safe-area-inset-bottom))] sm:pb-[calc(8.5rem+env(safe-area-inset-bottom))]"
                : "pb-[calc(12rem+env(safe-area-inset-bottom))] sm:pb-[calc(8.5rem+env(safe-area-inset-bottom))]",
            )}
          >
            {messages.length === 0 ? (
              /* --- Empty State / Hero Landing --- */
              <div className="flex flex-col items-center pt-0 text-center">
                {snapshots.length > 0 && (
                  <div className="mb-6 w-full max-w-[500px] text-left">
                    <LocalHistoryPanel
                      snapshots={snapshots}
                      onRestore={handleRestoreSnapshot}
                      onRename={handleRenameSnapshot}
                      onDelete={handleDeleteSnapshot}
                      onClearAll={handleClearAllSnapshots}
                    />
                  </div>
                )}
                <NaLILogoMark variant="light" size={52} className="drop-shadow-[0_4px_18px_rgba(0,255,179,0.12)]" />
                <h1 className="mt-2 font-serif text-4xl font-semibold text-[#f5f0e8] md:text-5xl">Buat Laporan</h1>
                <p className="mt-2 max-w-[500px] text-base leading-6 text-[#a1b3a8]">
                  Masukkan materi atau topik untuk menyusun draf laporan dengan batas bukti yang jelas.
                </p>
                <p className="mt-2.5 max-w-[500px] text-[11px] leading-5 text-[#a1b3a8]/70">
                  Jalur starter gratis tersedia terbatas dan tetap dibatasi laju penggunaan. Paket Laporan belum aktif
                  di CP1.
                </p>

                {/* Initial Mode Toggle */}
                <div className="mt-3 grid w-full max-w-[500px] grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("draft_from_materials")}
                    className={cn(
                      "rounded-xl border p-3 text-left transition duration-200",
                      selectedMode === "draft_from_materials"
                        ? "border-[#00FFB3]/30 bg-[#00FFB3]/5 text-[#f5f0e8]"
                        : "border-[#14261c] bg-[#08100c] text-[#a1b3a8] hover:bg-[#14261c]/40",
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-[#00FFB3]" />
                      Punya Bahan
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-[#a1b3a8]/70">
                      Gunakan catatan, URL, atau observasi.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("start_from_zero")}
                    className={cn(
                      "rounded-xl border p-3 text-left transition duration-200",
                      selectedMode === "start_from_zero"
                        ? "border-[#00FFB3]/30 bg-[#00FFB3]/5 text-[#f5f0e8]"
                        : "border-[#14261c] bg-[#08100c] text-[#a1b3a8] hover:bg-[#14261c]/40",
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Compass className="h-4 w-4 text-[#00FFB3]" />
                      Mulai dari Nol
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-[#a1b3a8]/70">
                      Minta panduan, outline, dan checklist bukti.
                    </span>
                  </button>
                </div>

                {/* Templates Selector */}
                <div className="mt-2 w-full max-w-[500px] text-left">
                  <label className="mb-1.5 block text-xs font-semibold tracking-[0.08em] text-[#a1b3a8] uppercase">
                    Template Laporan
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full rounded-xl border border-[#14261c] bg-[#08100c]/60 px-4 py-2.5 text-sm text-[#f5f0e8] focus:border-[#00FFB3]/30 focus:outline-none"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl} value={tpl} className="bg-[#08100c] text-[#f5f0e8]">
                        {tpl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* --- Chat message feed --- */
              messages.map((message, index) => {
                const isUser = message.role === "user";
                const isSystem = message.role === "system";

                if (isSystem) {
                  const normalized = normalizePublicError({
                    message: message.content,
                  });
                  return (
                    <NaliAlert
                      key={message.id}
                      variant={normalized.severity}
                      title={normalized.title}
                      explanation={normalized.explanation}
                      nextStep={normalized.nextStep}
                      className="my-2"
                    />
                  );
                }

                return (
                  <div key={message.id} className={cn("flex flex-col space-y-2", isUser ? "items-end" : "items-start")}>
                    <div className="px-2 text-[10px] text-white/30">{message.role === "user" ? "Anda" : "NaLI"}</div>

                    <div
                      className={cn(
                        "w-full max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 break-words shadow-xl sm:w-auto sm:max-w-[85%]",
                        isUser
                          ? "border border-[#00FFB3]/15 bg-[#00FFB3]/5 text-[#f5f0e8]"
                          : "border border-white/[0.06] bg-white/[0.03] text-white/90",
                      )}
                    >
                      {(() => {
                        const reportData = message.metadata?.new_report;
                        if (!isUser && reportData && (reportData.understanding || reportData.plan)) {
                          const understanding = reportData.understanding;
                          const plan = reportData.plan;
                          const evidenceStrength = reportData.evidence_strength;
                          const sourceCoverage = reportData.source_coverage;
                          const missingEvidence = reportData.missing_evidence;
                          const evidenceWarnings = reportData.evidence_warnings;
                          const suggestedActions = reportData.suggested_actions;
                          const isLastMessage = index === messages.length - 1;

                          return (
                            <div className="space-y-4">
                              <p className="whitespace-pre-wrap text-white/80">{message.content}</p>

                              {understanding && (
                                <div className="rounded-xl border border-[#00FFB3]/15 bg-[#00FFB3]/5 p-3.5 shadow-md">
                                  <div className="flex gap-2.5">
                                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-[#00FFB3]" />
                                    <div>
                                      <h4 className="text-[10px] font-bold tracking-wider text-[#00FFB3]/80 uppercase">
                                        NaLI Understanding
                                      </h4>
                                      <p className="mt-1 text-xs leading-relaxed text-white/80">{understanding}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {plan && plan.length > 0 && (
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5 shadow-md">
                                  <div className="flex gap-2.5">
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                    <div className="w-full">
                                      <h4 className="text-[10px] font-bold tracking-wider text-emerald-300/80 uppercase">
                                        Rencana Kerja Agensi
                                      </h4>
                                      <div className="mt-2 space-y-1.5">
                                        {plan.map((step: string, sIdx: number) => (
                                          <div key={sIdx} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                            <span className="text-xs leading-normal font-medium text-white/70">
                                              {step}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(evidenceStrength ||
                                sourceCoverage ||
                                (missingEvidence && missingEvidence.length > 0) ||
                                (evidenceWarnings && evidenceWarnings.length > 0)) && (
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5 shadow-md">
                                  <div className="flex gap-2.5">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                    <div className="w-full">
                                      <h4 className="text-[10px] font-bold tracking-wider text-amber-300/80 uppercase">
                                        NaLI Evidence Auditor
                                      </h4>

                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {evidenceStrength && (
                                          <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/70">
                                            <span className="font-semibold tracking-tight text-white/40 uppercase">
                                              Kekuatan:
                                            </span>
                                            <span
                                              className={cn(
                                                "ml-1 font-bold",
                                                evidenceStrength === "strong" && "text-emerald-400",
                                                evidenceStrength === "medium" && "text-amber-400",
                                                evidenceStrength === "weak" && "text-rose-400",
                                              )}
                                            >
                                              {evidenceStrength === "strong"
                                                ? "Kuat"
                                                : evidenceStrength === "medium"
                                                  ? "Sedang"
                                                  : "Lemah"}
                                            </span>
                                          </div>
                                        )}
                                        {sourceCoverage && (
                                          <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/70">
                                            <span className="font-semibold tracking-tight text-white/40 uppercase">
                                              Sumber:
                                            </span>
                                            <span
                                              className={cn(
                                                "ml-1 font-bold",
                                                sourceCoverage === "strong" && "text-emerald-400",
                                                sourceCoverage === "adequate" && "text-amber-400",
                                                sourceCoverage === "limited" && "text-rose-400",
                                              )}
                                            >
                                              {sourceCoverage === "strong"
                                                ? "Lengkap"
                                                : sourceCoverage === "adequate"
                                                  ? "Cukup"
                                                  : "Terbatas"}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {evidenceWarnings && evidenceWarnings.length > 0 && (
                                        <div className="mt-2.5 space-y-1 border-t border-white/[0.04] pt-2">
                                          <span className="block text-[9px] font-bold tracking-wider text-rose-300/80 uppercase">
                                            Peringatan Integritas
                                          </span>
                                          <ul className="list-disc space-y-0.5 pl-3.5 text-[11px] leading-relaxed text-white/60">
                                            {evidenceWarnings.map((warn: string, wIdx: number) => (
                                              <li key={wIdx}>{warn}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {missingEvidence && missingEvidence.length > 0 && (
                                        <div className="mt-2.5 space-y-1 border-t border-white/[0.04] pt-2">
                                          <span className="block text-[9px] font-bold tracking-wider text-amber-300/80 uppercase">
                                            Rekomendasi Bukti Tambahan
                                          </span>
                                          <ul className="list-disc space-y-0.5 pl-3.5 text-[11px] leading-relaxed text-white/60">
                                            {missingEvidence.map((me: string, mIdx: number) => (
                                              <li key={mIdx}>{me}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {isLastMessage &&
                                suggestedActions &&
                                suggestedActions.length > 0 &&
                                activeRunStatus === "idle" && (
                                  <div className="mt-3 border-t border-white/[0.04] pt-2.5">
                                    <span className="mb-2 block text-[9px] font-bold tracking-wider text-white/40 uppercase">
                                      Tindakan Lanjutan Yang Disarankan
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {suggestedActions.map((act: { label: string; prompt: string }, aIdx: number) => (
                                        <button
                                          key={aIdx}
                                          type="button"
                                          onClick={() => handleQuickAction(act.prompt)}
                                          className="inline-flex min-h-[44px] cursor-pointer items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-left text-xs text-white/50 transition duration-200 hover:bg-white/[0.06] hover:text-white"
                                        >
                                          {act.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {isLastMessage && activeRunStatus === "idle" && (
                                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-white/35">
                                  <ArrowRight className="h-3 w-3 shrink-0 animate-pulse text-[#00FFB3]" />
                                  <span>Ketik pesan lanjutan atau gunakan tombol di atas untuk merevisi.</span>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return <p className="whitespace-pre-wrap">{message.content}</p>;
                      })()}
                    </div>

                    {/* Inline report preview updates (Proposed Drafts) */}
                    {message.metadata?.new_report && (
                      <div className="mt-2 w-full">
                        <ReportResultCard
                          report={message.metadata.new_report}
                          onApply={
                            report?.id === message.metadata?.new_report?.id &&
                            JSON.stringify(report) !== JSON.stringify(message.metadata?.new_report)
                              ? () => handleApplyProposedReport(message.metadata?.new_report)
                              : undefined
                          }
                          copyStatus={copyStatus}
                          onCopy={handleCopyMarkdown}
                          copyTextStatus={copyTextStatus}
                          onCopyText={handleCopyPlainText}
                          onDownloadMarkdownLocal={handleDownloadMarkdownLocal}
                          onDownloadTextLocal={handleDownloadTextLocal}
                        />

                        {/* Inline feedback prompt — shows once after first report preview */}
                        {message.type === "report_preview" &&
                          !inlineFeedbackSent &&
                          index === messages.findIndex((m) => m.type === "report_preview") && (
                            <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 backdrop-blur-sm">
                              <p className="text-xs font-medium text-white/60">Apakah hasil ini membantu?</p>
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={inlineFeedbackSending}
                                  onClick={async () => {
                                    setInlineFeedbackSending(true);
                                    try {
                                      const rid = report?.id || message.metadata?.new_report?.id;
                                      if (rid) {
                                        await fetch(`/api/reports/${rid}/feedback`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            rating: "helpful",
                                            comment: inlineFeedbackComment || "",
                                            report_access_key: accessKey || "",
                                          }),
                                        });
                                      }
                                    } catch {
                                      /* silent */
                                    }
                                    setInlineFeedbackSent(true);
                                    setInlineFeedbackSending(false);
                                  }}
                                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-500/15"
                                >
                                  👍 Ya
                                </button>
                                <button
                                  type="button"
                                  disabled={inlineFeedbackSending}
                                  onClick={async () => {
                                    setInlineFeedbackSending(true);
                                    try {
                                      const rid = report?.id || message.metadata?.new_report?.id;
                                      if (rid) {
                                        await fetch(`/api/reports/${rid}/feedback`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            rating: "not_helpful",
                                            comment: inlineFeedbackComment || "",
                                            report_access_key: accessKey || "",
                                          }),
                                        });
                                      }
                                    } catch {
                                      /* silent */
                                    }
                                    setInlineFeedbackSent(true);
                                    setInlineFeedbackSending(false);
                                  }}
                                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] font-medium text-white/50 transition hover:bg-white/[0.06]"
                                >
                                  👎 Belum
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInlineFeedbackExpanded(!inlineFeedbackExpanded)}
                                  className="text-[11px] text-white/35 transition hover:text-white/50"
                                >
                                  Tulis feedback
                                </button>
                              </div>
                              {inlineFeedbackExpanded && (
                                <textarea
                                  value={inlineFeedbackComment}
                                  onChange={(e) => setInlineFeedbackComment(e.target.value)}
                                  placeholder="Bagian mana yang kurang jelas?"
                                  rows={2}
                                  className="mt-2 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/70 placeholder-white/25 outline-none"
                                />
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Simulated Progressive Task checklist / Agent Plan Panel */}
            {activeRunStatus === "running" && (
              <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Rencana Kerja NaLI (Active Plan)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                    Status: {reportStatus === "rate limited" ? "Laju Dibatasi" : reportStatus === "integrity blocked" ? "Integritas Ditolak" : reportStatus}
                  </span>
                </div>
                
                <div className="relative border-l border-white/[0.08] ml-2 pl-4 space-y-4 text-xs">
                  {[
                    { key: "validating", label: "Memvalidasi Input & Integritas Akademik" },
                    { key: "planning", label: "Memetakan Klaim & Merancang Rencana Kerja" },
                    { key: "generating", label: "Menyusun Draft Laporan Awal Berbasis Bukti" },
                    { key: "quality checking", label: "Mengaudit Kekuatan Bukti (Evidence Quality)" }
                  ].map((step, idx) => {
                    const stepKeys = ["validating", "planning", "generating", "quality checking"];
                    const currentIdx = stepKeys.indexOf(reportStatus);
                    const stepIdx = stepKeys.indexOf(step.key);
                    
                    let status: "pending" | "in_progress" | "completed" = "pending";
                    if (currentIdx > stepIdx) {
                      status = "completed";
                    } else if (currentIdx === stepIdx) {
                      status = "in_progress";
                    }
                    
                    return (
                      <div key={idx} className="relative flex items-start gap-2.5">
                        <div className="absolute -left-[21px] top-0.5">
                          {status === "completed" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 bg-[#060b08] rounded-full" />
                          ) : status === "in_progress" ? (
                            <span className="flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent bg-[#060b08]" />
                          ) : (
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#060b08]">
                              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              status === "completed"
                                ? "text-emerald-400/80 line-through decoration-emerald-400/20"
                                : status === "in_progress"
                                  ? "font-semibold text-white"
                                  : "text-white/40",
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Validation notifications */}
            {showValidation &&
              (() => {
                const variant = validationIssue.severity === "error" ? "error" : "warning";
                const nextStep = validationIssue.suggestions.join(" ");
                let actionLabel: string | undefined = undefined;
                let onAction: (() => void) | undefined = undefined;

                if (
                  validationIssue.code === "TOO_SHORT" ||
                  validationIssue.code === "EMPTY_QUERY" ||
                  validationIssue.code === "QUERY_TOO_SHORT"
                ) {
                  actionLabel = "Ubah Pesan";
                  onAction = () => {
                    composerRef.current?.focus();
                  };
                }

                return (
                  <NaliAlert
                    variant={variant}
                    title={validationIssue.title}
                    explanation={validationIssue.message}
                    nextStep={nextStep}
                    actionLabel={actionLabel}
                    onAction={onAction}
                  />
                );
              })()}

            {/* Error notifications */}
            {error &&
              (() => {
                const normalized = normalizePublicError({
                  status: error.status,
                  code: error.code,
                  message: error.message,
                  retryAfterSeconds: error.retryAfterSeconds,
                });

                let actionLabel: string | undefined = undefined;
                let onAction: (() => void) | undefined = undefined;

                if (normalized.category === "RATE_LIMIT") {
                  if (error.retryAfterSeconds === undefined || error.retryAfterSeconds <= 0) {
                    actionLabel = "Coba Lagi";
                    onAction = () => {
                      if (messages.length === 0) {
                        handleInitialSubmit();
                      } else {
                        handleFollowUpSubmit(undefined, lastAttemptedQuery);
                      }
                    };
                  }
                } else if (normalized.category === "NETWORK_OR_SERVER") {
                  actionLabel = "Coba Lagi";
                  onAction = () => {
                    if (messages.length === 0) {
                      handleInitialSubmit();
                    } else {
                      handleFollowUpSubmit(undefined, lastAttemptedQuery);
                    }
                  };
                } else if (normalized.category === "INTEGRITY_BLOCK") {
                  actionLabel = "Ubah Materi";
                  onAction = () => {
                    setError(null);
                    composerRef.current?.focus();
                  };
                } else if (normalized.category === "WEAK_INPUT") {
                  actionLabel = "Tambah Detail";
                  onAction = () => {
                    setError(null);
                    composerRef.current?.focus();
                  };
                }

                return (
                  <NaliAlert
                    variant={normalized.severity}
                    title={normalized.title}
                    explanation={normalized.explanation}
                    nextStep={normalized.nextStep}
                    retryAfterSeconds={error.retryAfterSeconds}
                    actionLabel={actionLabel}
                    onAction={onAction}
                  />
                );
              })()}

            {/* Notice notifications */}
            {notice && <NaliAlert variant="success" title="Notifikasi" explanation={notice} />}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Bottom Composer and Control chips */}
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#060b08] via-[#060b08]/95 to-transparent px-4 pt-8 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8">
          <div className="mx-auto max-w-[760px] space-y-3">
            {/* Quick Action / Suggested action chips near composer */}
            {activeRunStatus === "idle" && (() => {
              const actions = messages.length > 0 
                ? (report?.suggested_actions && report.suggested_actions.length > 0
                    ? report.suggested_actions
                    : [
                        { label: "Kesimpulan Formal", prompt: "Tulis kesimpulan lebih formal" },
                        { label: "Perpendek Ringkasan", prompt: "Buat ringkasan draf di atas menjadi lebih pendek" },
                        { label: "Perkuat Temuan", prompt: "Perkuat analisis bagian temuan" },
                        { label: "Tambahkan Rekomendasi", prompt: "Tambahkan poin rekomendasi praktis" },
                      ])
                : [
                    { label: "📍 Tambah lokasi", prompt: "Tolong tambahkan detail lokasi pengamatan di: " },
                    { label: "🔬 Tambah metode", prompt: "Tolong tambahkan metode penelitian yang digunakan: " },
                    { label: "📋 Tambah bukti", prompt: "Berikut bukti pengamatan tambahan yang saya temukan: " },
                    { label: "🔍 Cek kekurangan", prompt: "Cek kekurangan bukti dan ketidakpastian draf ini" },
                    { label: "📝 Susun draft", prompt: "Bantu saya menyusun draf laporan terstruktur dari bahan ini" },
                    { label: "📐 Perbaiki struktur", prompt: "Tolong perbaiki struktur laporan sesuai format IMRaD" },
                  ];
              return (
                <div className="flex flex-wrap justify-center gap-2 py-1 md:justify-start">
                  {actions.map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAction(act.prompt)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-white/70 transition duration-200 hover:bg-white/[0.06] hover:text-white"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              );
            })()}

            <form
              onSubmit={messages.length === 0 ? handleInitialSubmit : handleFollowUpSubmit}
              className="group relative"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-[#00FFB3]/10 opacity-30 blur-md transition duration-500 group-focus-within:opacity-60 group-hover:opacity-50" />

              <div className="relative flex min-h-[48px] items-end gap-2 rounded-2xl border border-[#14261c] bg-[#08100c]/80 p-2 shadow-2xl backdrop-blur-2xl transition duration-300 focus-within:border-[#00FFB3]/30 focus-within:bg-[#08100c] sm:min-h-[56px]">
                <div className="flex-1 px-3 py-1">
                  <textarea
                    ref={composerRef}
                    rows={1}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsComposerFocused(true)}
                    onBlur={() => setIsComposerFocused(false)}
                    disabled={isRateLimited}
                    placeholder={
                      isRateLimited
                        ? "Batas percobaan tercapai. Silakan tunggu..."
                        : messages.length === 0
                          ? "Ketik catatan, topik, lokasi atau ringkasan materi observasi..."
                          : "Ketik instruksi penyuntingan draf lanjutan (misal: 'perpendek', 'tulis kesimpulan formal')..."
                    }
                    className="max-h-32 w-full resize-none border-none bg-transparent py-1 text-[14px] leading-6 text-white placeholder-white/30 outline-none disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                </div>

                <div className="flex shrink-0 items-center gap-1.5 px-1">
                  <button
                    type="submit"
                    disabled={
                      activeRunStatus === "running" ||
                      !query.trim() ||
                      (messages.length === 0 && !integrityConsent) ||
                      isRateLimited
                    }
                    aria-label={selectedMode === "draft_from_materials" ? "Buat Laporan" : "Buat Panduan Awal"}
                    className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white text-zinc-950 transition duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                  >
                    {activeRunStatus === "running" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                    ) : (
                      <Send className="h-4 w-4 text-zinc-950" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {messages.length === 0 && (
              <p className="text-center text-[11px] leading-5 text-white/40">
                Buat Laporan dengan jalur starter gratis terbatas. Paket Laporan lengkap belum aktif di CP1.
              </p>
            )}

            {/* Academic Integrity consent checkbox (rendered only at start or when required) */}
            {messages.length === 0 && (
              <label className="flex cursor-pointer items-start justify-center gap-2.5 text-[12px] leading-5 text-white/40 transition hover:text-white/60">
                <input
                  type="checkbox"
                  checked={integrityConsent}
                  onChange={(e) => setIntegrityConsent(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>
                  Saya menyetujui pernyataan integritas akademik NaLI. Output adalah draf/panduan awal belajar, bukan
                  plagiarisme atau karya akhir otomatis.
                </span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Inline Report preview renderer sub-component --- */
interface ReportResultCardProps {
  report: ReportResult;
  onApply?: () => void;
  copyStatus: boolean;
  onCopy: () => void;
  copyTextStatus?: boolean;
  onCopyText?: () => void;
  onDownloadMarkdownLocal?: () => void;
  onDownloadTextLocal?: () => void;
}

function ReportResultCard({
  report,
  onApply,
  copyStatus,
  onCopy,
  copyTextStatus,
  onCopyText,
  onDownloadMarkdownLocal,
  onDownloadTextLocal,
}: ReportResultCardProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "evidence" | "uncertainty">("preview");

  const isGuide = report.mode === "start_from_zero";

  const renderTabContent = () => {
    if (isGuide) {
      const guide = report as StartFromZeroGuide;
      switch (activeTab) {
        case "preview":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="block text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
                  Panduan Awal
                </span>
                <p className="mt-1">{guide.integrity_note}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
                  Kerangka Topik
                </span>
                <p className="mt-1">{guide.topic_framing}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
                  Outline Laporan
                </span>
                <ul className="mt-1.5 list-decimal space-y-1 pl-4">
                  {guide.suggested_outline.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        case "evidence":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="block text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
                  Checklist Bukti yang Diperlukan
                </span>
                <ul className="mt-1.5 space-y-1.5">
                  {guide.evidence_checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-white/35" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
                  Pertanyaan Observasi
                </span>
                <ul className="mt-1.5 space-y-1.5">
                  {guide.observation_questions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 font-mono text-xs text-white/30">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        case "uncertainty":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="block text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
                  Batasan Etika & Keamanan
                </span>
                <p className="mt-1">{guide.safety_or_ethics_note}</p>
              </div>
              <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-amber-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                  Disclaimer Panduan Mulai
                </span>
                <p className="mt-1.5 leading-5">{guide.disclaimer}</p>
              </div>
            </div>
          );
      }
    } else {
      const draft = report as DraftReport;
      switch (activeTab) {
        case "preview":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Ringkasan Singkat
                </span>
                <p className="mt-1">{draft.executive_summary}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Latar Belakang & Konteks
                </span>
                <p className="mt-1">{draft.background}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Metodologi & Bahan
                </span>
                <p className="mt-1">{draft.method_or_materials}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Temuan Utama
                </span>
                <ul className="mt-1.5 space-y-1.5">
                  {draft.findings.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="mt-1 h-4 w-4 shrink-0 text-white/30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {draft.conclusion && (
                <div className="border-t border-white/[0.04] pt-3">
                  <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    Kesimpulan Sementara
                  </span>
                  <p className="mt-1">{draft.conclusion}</p>
                </div>
              )}
            </div>
          );
        case "evidence":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="mb-2 block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Evidence Table
                </span>
                <div className="overflow-x-auto rounded-lg border border-white/[0.05] bg-white/[0.01]">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-3 py-2 text-white/40">ID</th>
                        <th className="px-3 py-2 text-white/40">Tipe</th>
                        <th className="px-3 py-2 text-white/40">Ringkasan</th>
                        <th className="px-3 py-2 text-white/40">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draft.evidence_table.map((row) => (
                        <tr key={row.id} className="border-b border-white/[0.04] last:border-none">
                          <td className="px-3 py-2.5 font-mono text-[10px] text-white/50">{row.id}</td>
                          <td className="px-3 py-2.5 text-white/60">{row.material_type}</td>
                          <td className="max-w-[200px] truncate px-3 py-2.5 text-white/50">{row.summary}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex rounded border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/45">
                              {row.verification_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Catatan Sumber
                </span>
                <ul className="mt-1.5 space-y-1 text-xs text-white/45">
                  {draft.source_notes.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        case "uncertainty":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Confidence Note & Batasan
                </span>
                <p className="mt-1">{draft.uncertainty_note}</p>
              </div>
              <div>
                <span className="mb-2 block text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Checklist Review Mandiri
                </span>
                <ul className="space-y-1.5">
                  {draft.user_review_checklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-white/30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-amber-200/80">
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                  Disclaimer Integritas Akademik
                </span>
                <p className="mt-1.5 leading-5">{draft.disclaimer}</p>
              </div>
            </div>
          );
      }
    }
  };

  return (
    <div className="z-10 mt-3 w-full overflow-hidden rounded-2xl border border-[#14261c] bg-[#08100c]/80 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex flex-col">
          <span className="text-xs text-white/40">{report.report_type}</span>
          <span className="text-sm font-semibold text-white/80">{report.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {onApply && (
            <Button
              size="sm"
              onClick={onApply}
              className="h-7 cursor-pointer bg-emerald-500 px-3 text-[11px] font-bold text-zinc-950 hover:bg-emerald-400"
            >
              Terapkan Perubahan
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.04] bg-white/[0.01] px-1 text-[11px] sm:px-4 sm:text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex min-h-[44px] flex-1 cursor-pointer items-center justify-center border-b-2 px-2 py-3 text-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sm:flex-initial sm:px-4 sm:py-2.5",
            activeTab === "preview"
              ? "border-emerald-400 text-white"
              : "border-transparent text-white/40 hover:text-white",
          )}
        >
          Isi Draft
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("evidence")}
          className={cn(
            "flex min-h-[44px] flex-1 cursor-pointer items-center justify-center border-b-2 px-2 py-3 text-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sm:flex-initial sm:px-4 sm:py-2.5",
            activeTab === "evidence"
              ? "border-emerald-400 text-white"
              : "border-transparent text-white/40 hover:text-white",
          )}
        >
          {isGuide ? "Checklist" : "Bukti / Sumber"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("uncertainty")}
          className={cn(
            "flex min-h-[44px] flex-1 cursor-pointer items-center justify-center border-b-2 px-2 py-3 text-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none sm:flex-initial sm:px-4 sm:py-2.5",
            activeTab === "uncertainty"
              ? "border-emerald-400 text-white"
              : "border-transparent text-white/40 hover:text-white",
          )}
        >
          Integritas & Batasan
        </button>
      </div>

      {/* Tab content panel */}
      <div className="max-h-[380px] overflow-y-auto bg-white/[0.01] p-5">{renderTabContent()}</div>

      {/* Actions footer bar */}
      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs">
        <Button
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="h-11 cursor-pointer border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white sm:h-8"
        >
          <Clipboard className="mr-1.5 h-3.5 w-3.5" />
          {copyStatus ? "Tersalin!" : "Salin Markdown"}
        </Button>

        {onCopyText && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCopyText}
            className="h-11 cursor-pointer border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white sm:h-8"
          >
            <Clipboard className="mr-1.5 h-3.5 w-3.5" />
            {copyTextStatus ? "Tersalin!" : "Salin teks biasa"}
          </Button>
        )}

        {onDownloadMarkdownLocal && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDownloadMarkdownLocal}
            className="h-11 cursor-pointer border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white sm:h-8"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Unduh Markdown lokal
          </Button>
        )}

        {onDownloadTextLocal && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDownloadTextLocal}
            className="h-11 cursor-pointer border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white sm:h-8"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Unduh teks lokal
          </Button>
        )}

        <p className="mt-1 flex w-full items-start gap-1.5 text-[10px] leading-5 text-white/30 italic">
          <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          PDF/DOCX publik tetap terkunci / inactive di CP1. Gunakan salinan Markdown atau teks lokal di atas.
        </p>
      </div>
    </div>
  );
}

interface LocalHistoryPanelProps {
  snapshots: GuestReportRecoverySnapshot[];
  onRestore: (s: GuestReportRecoverySnapshot) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const LocalHistoryPanel = memo(function LocalHistoryPanel({
  snapshots,
  onRestore,
  onRename,
  onDelete,
  onClearAll,
}: LocalHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (snapshots.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-[#14261c] bg-[#08100c]/40 p-3 shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-between px-1 text-xs font-bold tracking-wider text-white/50 uppercase transition hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          📁 Riwayat lokal browser
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">{snapshots.length}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 border-t border-white/[0.04] pt-2">
          {snapshots.map((item) => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const statusLabel =
              {
                autosaved_draft: "Autosave",
                generation_failed: "Gagal",
                draft_ready: "Siap",
                chat_updated: "Chat",
              }[item.status] || "Draft";

            const statusColors =
              {
                autosaved_draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                generation_failed: "bg-red-500/10 text-red-400 border-red-500/20",
                draft_ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                chat_updated: "border-[#00FFB3]/20 bg-[#00FFB3]/10 text-[#00FFB3]",
              }[item.status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-white/[0.04] bg-white/[0.01] p-2.5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="max-w-[200px] truncate text-xs font-semibold text-white/80" title={item.title}>
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase",
                        statusColors,
                      )}
                    >
                      {statusLabel}
                    </span>
                    <span className="font-mono text-[10px] text-white/30">{timeStr}</span>
                  </div>
                  <p className="max-w-[400px] truncate text-[11px] text-white/50">
                    {item.mainText || "Tidak ada materi teks."}
                  </p>
                </div>

                <div className="mt-1 flex shrink-0 flex-wrap items-center gap-1 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => onRestore(item)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg bg-white px-3 text-[11px] font-semibold text-zinc-950 transition hover:bg-white/90 sm:min-h-[36px]"
                  >
                    Pulihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => onRename(item.id, item.title)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-white/5 px-3 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white sm:min-h-[36px]"
                  >
                    Ganti nama
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/20 sm:min-h-[36px]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-white/5 px-3 text-[11px] font-semibold text-red-400 transition hover:border-red-500/20 hover:bg-red-500/10 sm:min-h-[36px]"
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
