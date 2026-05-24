"use client";

import { FormEvent, useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
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
import { NaLILogoMark } from "@/components/ui/NaLILogoMark";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ReportResult, DraftReport, StartFromZeroGuide } from "@/lib/reports/reportGenerator";
import { buildReportMarkdown } from "@/lib/reports/markdown";
import { UpgradeModal } from "./UpgradeModal";
import { getEstimatedCreditCostFromQuery } from "@/lib/pricing/plans";
import { NaliAlert } from "@/components/ui/NaliAlert";
import { normalizePublicError } from "@/lib/errors/publicErrors";
import { naliModels } from "@/lib/models/naliModels";
import {
  saveGuestReportRecovery,
  clearGuestReportRecovery,
  loadLatestGuestReportRecovery,
  pruneExpiredGuestRecoveries,
  renameGuestReportRecovery,
  listGuestReportRecoveries,
  type GuestReportRecoverySnapshot
} from "@/lib/reports/clientRecovery";
import { validateComposerInput } from "@/lib/reports/inputValidation";
import { useDebouncedComposerValidation } from "@/lib/reports/useDebouncedValidation";

// Types matching backend AgentMessage schema
type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  type:
    | "plain"
    | "plan"
    | "progress"
    | "report_preview"
    | "evidence_status"
    | "quality_status"
    | "error"
    | "action";
  content: string;
  metadata?: {
    run_id?: string;
    step_id?: string;
    evidence_strength?: "weak" | "medium" | "strong";
    source_coverage?: "limited" | "adequate" | "strong";
    academic_integrity?: "safe" | "warning" | "blocked";
    credit_cost?: number;
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
  const [activeRunStatus, setActiveRunStatus] = useState<"idle" | "running" | "completed" | "failed" | "blocked">("idle");
  
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
  const [selectedModel, setSelectedModel] = useState<"peregrine" | "obsidian" | "zephyr">("peregrine");
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
  const [error, setError] = useState<{ message: string; code?: string; status?: number; retryAfterSeconds?: number } | null>(null);
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
  
  // Credits & Monetization state
  const [credits, setCredits] = useState<number | null>(null);
  const [ledgerReady, setLedgerReady] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const [exportReadiness, setExportReadiness] = useState<"export_ready" | "export_locked" | "unknown">("unknown");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showExportStatus, setShowExportStatus] = useState(false);

  // Progressive steps simulation state for optimistic UI
  const [optimisticSteps, setOptimisticSteps] = useState<Array<{ label: string; status: "pending" | "in_progress" | "completed" }>>([]);

  // Inline feedback state
  const [inlineFeedbackSent, setInlineFeedbackSent] = useState(false);
  const [inlineFeedbackExpanded, setInlineFeedbackExpanded] = useState(false);
  const [inlineFeedbackComment, setInlineFeedbackComment] = useState("");
  const [inlineFeedbackSending, setInlineFeedbackSending] = useState(false);

  // Paid intent signal state (UI-only, uses feedback API)
  const [paidIntentSent, setPaidIntentSent] = useState(false);
  const [paidIntentSending, setPaidIntentSending] = useState(false);

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
                content: localReport.mode === "start_from_zero" ? "Mulai panduan dari nol" : "Buat draf laporan berbasis bukti",
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
          if (payload.export_readiness) {
            setExportReadiness(payload.export_readiness);
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

  const fetchBalance = async () => {
    try {
      let guestSessionId = window.localStorage.getItem("nali-guest-session-id");
      if (!guestSessionId) {
        guestSessionId = typeof crypto !== "undefined" && "randomUUID" in crypto 
          ? crypto.randomUUID() 
          : `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        window.localStorage.setItem("nali-guest-session-id", guestSessionId);
      }

      const res = await fetch(`/api/energy/balance?guestSessionId=${encodeURIComponent(guestSessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ready) {
          setCredits(data.balance);
          setLedgerReady(true);
        } else {
          setLedgerReady(false);
        }
      }
    } catch {
      // ignore
    }
  };

  // Load thread list on mount
  useEffect(() => {
    loadRecentThreads();
    fetchBalance();

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

    const params = new URLSearchParams(window.location.search);
    const itemType = params.get("item_type");
    const itemId = params.get("item_id");
    if (itemType && itemId) {
      setIsUpgradeOpen(true);
      // Clear query params
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
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
        selectedModel: selectedModel,
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
  }, [
    query,
    selectedMode,
    selectedModel,
    selectedTemplate,
    integrityConsent,
    initialReportId,
    report?.title,
    loadSnapshots,
  ]);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const handleRestoreSnapshot = useCallback((snapshot: GuestReportRecoverySnapshot) => {
    // Restore requires user action, warn first if active input exists
    if (queryRef.current.trim()) {
      const confirmOverwrite = window.confirm("Apakah Anda ingin menimpa input aktif saat ini dengan draft yang dipulihkan?");
      if (!confirmOverwrite) return;
    }

    const id = snapshot.id;
    const storedToken = window.localStorage.getItem(`nali-report-access:${id}`) ||
                        window.localStorage.getItem(`nali-report-access-key:${id}`) ||
                        window.localStorage.getItem(`nali-report-key:${id}`) ||
                        window.localStorage.getItem(`nali-report-access-token:${id}`);

    // Rule 7: If snapshot has reportId but no access key, restore draft/composer state
    if ((snapshot.status === "draft_ready" || snapshot.status === "chat_updated") && storedToken && id && !id.startsWith("temp-") && id !== "composer-autosave") {
      router.push(`/report/${id}?token=${encodeURIComponent(storedToken)}`);
    } else {
      setQuery(snapshot.mainText || "");
      setSelectedMode(snapshot.mode || "draft_from_materials");
      setSelectedModel(snapshot.selectedModel || "peregrine");
      if (snapshot.reportTemplate) {
        setSelectedTemplate(snapshot.reportTemplate);
      }
      setIntegrityConsent(snapshot.integrityConsent || false);
      setError(null);
      setNotice(null);
      composerRef.current?.focus();
    }
  }, [router]);

  const handleRenameSnapshot = useCallback((id: string, currentTitle: string) => {
    const newTitle = window.prompt("Masukkan nama baru untuk draft ini:", currentTitle);
    if (newTitle === null) return;
    const success = renameGuestReportRecovery(id, newTitle);
    if (success) {
      loadSnapshots();
    } else {
      alert("Gagal mengubah nama draft.");
    }
  }, [loadSnapshots]);

  const handleDeleteSnapshot = useCallback((id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
      clearGuestReportRecovery(id);
      loadSnapshots();
    }
  }, [loadSnapshots]);

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
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReportId]);

  // Run progress simulation for optimistic UI
  const startProgressSimulation = () => {
    const steps = [
      { label: "Menganalisis Kueri", status: "in_progress" as const },
      { label: "Memeriksa Bukti Pengguna", status: "pending" as const },
      { label: "Menyusun Kerangka Draf", status: "pending" as const },
      { label: "Menyiapkan Opsi Ekspor", status: "pending" as const },
    ];
    setOptimisticSteps(steps);

    setTimeout(() => {
      setOptimisticSteps((curr) => {
        if (curr.length === 0) return [];
        return [
          { ...curr[0], status: "completed" },
          { ...curr[1], status: "in_progress" },
          curr[2],
          curr[3],
        ];
      });
    }, 800);

    setTimeout(() => {
      setOptimisticSteps((curr) => {
        if (curr.length === 0) return [];
        return [
          curr[0],
          { ...curr[1], status: "completed" },
          { ...curr[2], status: "in_progress" },
          curr[3],
        ];
      });
    }, 1800);

    setTimeout(() => {
      setOptimisticSteps((curr) => {
        if (curr.length === 0) return [];
        return [
          curr[0],
          curr[1],
          { ...curr[2], status: "completed" },
          { ...curr[3], status: "in_progress" },
        ];
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
        guestSessionId = typeof crypto !== "undefined" && "randomUUID" in crypto 
          ? crypto.randomUUID() 
          : `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        window.localStorage.setItem(guestSessionKey, guestSessionId);
      }

      const tempId = `temp-${Date.now()}`;
      saveGuestReportRecovery({
        id: tempId,
        title: selectedTemplate || "Draft Laporan",
        mode: selectedMode,
        selectedModel: selectedModel,
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
          selectedModel,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.report || !payload.id) {
        // Rule 7: Abuse-blocked prompts must not become recovery drafts.
        const isAbuseBlock = response.status === 400 && [
          "EMPTY_DRAFT_MATERIAL",
          "FINAL_ASSIGNMENT_WITHOUT_MATERIAL",
          "FAKE_CITATION_REQUEST",
          "FAKE_DATA_REQUEST",
          "PLAGIARISM_EVASION",
          "DO_MY_WORK"
        ].includes(payload.code || "");

        if (isAbuseBlock) {
          clearGuestReportRecovery(tempId);
          clearGuestReportRecovery("composer-autosave");
        }

        if (response.status === 402) {
          setError({
            message: payload.message ?? "Kredit energi Anda tidak cukup.",
            code: "insufficient_credits",
            status: response.status,
          });
          fetchBalance();
          setMessages([]);
          setActiveRunStatus("idle");
          setOptimisticSteps([]);
          return;
        }
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
        selectedModel: selectedModel,
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
      window.history.pushState(null, "", `/report/${reportId}`);
      fetchBalance();
    } catch {
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
        if (response.status === 402) {
          setError({
            message: payload.message ?? "Kredit energi Anda tidak cukup.",
            code: "insufficient_credits",
            status: response.status,
          });
          fetchBalance();
          setMessages((curr) => curr.filter((msg) => msg.id !== userMsgId));
          setActiveRunStatus("idle");
          setOptimisticSteps([]);
          return;
        }
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
        fetchBalance();

        // Also update recovery snapshot to reflect "chat_updated" status and the latest mainText
        saveGuestReportRecovery({
          id: initialReportId,
          title: report?.title || "Draft Laporan",
          mode: selectedMode,
          selectedModel: selectedModel,
          mainText: trimmed,
          status: "chat_updated",
          timestamp: Date.now(),
        });
      }
    } catch {
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

  // Premium export actions
  const handleExportUnlock = async () => {
    setExportNotice(null);
    if (!initialReportId || !accessKey) return;

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          export_type: "markdown",
          report_access_key: accessKey,
          report_id: initialReportId,
        }),
      });
      const payload = await response.json();

      if (response.ok && payload.snap_url) {
        window.location.href = payload.snap_url;
        return;
      }

      if (response.ok && payload.payment_mode === "manual") {
        setExportNotice("Permintaan ekspor tercatat sebagai pending. Export akan terbuka setelah sistem memverifikasi pembayaran.");
        setShowExportStatus(true);
        return;
      }

      setExportNotice(payload.error ?? "Pembayaran ekspor premium belum dapat dihubungkan saat ini.");
      setShowExportStatus(true);
    } catch {
      setExportNotice("Terjadi kesalahan. Gagal menghubungi gateway pembayaran.");
      setShowExportStatus(true);
    }
  };

  const handleDownloadExport = (format: "markdown" | "pdf") => {
    if (!initialReportId || !accessKey) return;
    const params = new URLSearchParams({ token: accessKey });
    if (format === "pdf") params.set("format", "pdf");
    window.open(`/api/reports/${initialReportId}/export?${params.toString()}`, "_blank");
  };

  // Local copy markdown
  const [copyStatus, setCopyStatus] = useState(false);
  const handleCopyMarkdown = async () => {
    if (!report) return;
    try {
      const markdown = buildReportMarkdown(report, {
        exportStatus: exportReadiness === "export_ready" ? "export_ready" : "preview_copy",
      });
      await navigator.clipboard.writeText(markdown);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch {
      alert("Gagal menyalin markdown.");
    }
  };

  // Heuristic cost calculation
  const estCreditCost = useMemo(() => {
    if (messages.length === 0) {
      return selectedMode === "start_from_zero" ? 10 : 20;
    }
    return getEstimatedCreditCostFromQuery(query);
  }, [messages.length, selectedMode, query]);

  const isInsufficient = useMemo(() => {
    if (!ledgerReady || credits === null) return false;
    return credits < estCreditCost;
  }, [ledgerReady, credits, estCreditCost]);

  const isRateLimited = error?.status === 429 || (error?.retryAfterSeconds !== undefined && error.retryAfterSeconds > 0);

  return (
    <div className="relative flex min-h-screen w-screen overflow-hidden bg-[#07090e] text-white">
      <FluidVideoBackground />

      {/* --- Sidebar --- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.06] bg-[#07090e]/95 backdrop-blur-2xl transition-transform duration-300 md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-emerald-400">NaLI</span>
            <span className="text-xs text-white/30">v1.5.3</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-white/40 hover:text-white md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <Link
            href="/create-report"
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition duration-200"
          >
            <Plus className="h-4 w-4" />
            Mulai Baru
          </Link>
        </div>

        {/* Thread History list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/20">Riwayat Percakapan</p>
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
                  initialReportId === thread.id ? "bg-white/[0.06] border border-white/[0.04]" : ""
                )}
              >
                <span className="font-semibold text-white/70 truncate">{thread.title}</span>
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
        <header className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-white/[0.06] bg-[#07090e]/60 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white/60 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Keluar
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {ledgerReady && credits !== null && (
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-400 cursor-pointer transition"
              >
                <span>⚡ {credits} Kredit</span>
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[11px] font-semibold text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {selectedMode === "start_from_zero" ? "Fast Mode" : "Advanced Report Mode"}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8 space-y-6 z-10">
          <div className={cn(
            "mx-auto max-w-[760px] space-y-6",
            isComposerFocused
              ? "pb-[calc(18rem+env(safe-area-inset-bottom))] sm:pb-[calc(8.5rem+env(safe-area-inset-bottom))]"
              : "pb-[calc(12rem+env(safe-area-inset-bottom))] sm:pb-[calc(8.5rem+env(safe-area-inset-bottom))]"
          )}>
            {messages.length === 0 ? (
              /* --- Empty State / Hero Landing --- */
              <div className="flex flex-col items-center text-center pt-16 md:pt-24">
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
                <NaLILogoMark size="md" className="shadow-2xl shadow-[#10b981]/10" />
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  NaLI Intelligence
                </h1>
                <p className="mt-3 max-w-[500px] text-base leading-6 text-white/60">
                  Masukkan materi lapangan, tautan, lokasi, atau kueri untuk menyusun draf laporan terstruktur secara instan.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-white/40">
                  <span>Estimasi biaya:</span>
                  <strong className="text-white/60 font-semibold">
                    {selectedMode === "start_from_zero" ? "10 Kredit (Fast Mode)" : "20 Kredit (Advanced Mode)"}
                  </strong>
                </div>

                {/* Initial Mode Toggle */}
                <div className="mt-8 grid grid-cols-2 gap-2 w-full max-w-[500px]">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("draft_from_materials")}
                    className={cn(
                      "rounded-xl border p-3 text-left transition duration-200",
                      selectedMode === "draft_from_materials"
                        ? "border-[#10b981]/30 bg-[#10b981]/5 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Punya Bahan
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-white/40">Gunakan catatan, URL, atau observasi.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("start_from_zero")}
                    className={cn(
                      "rounded-xl border p-3 text-left transition duration-200",
                      selectedMode === "start_from_zero"
                        ? "border-[#7c3aed]/30 bg-[#7c3aed]/5 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Compass className="h-4 w-4 text-indigo-400" />
                      Mulai dari Nol
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-white/40">Minta panduan, outline, dan checklist bukti.</span>
                  </button>
                </div>

                {/* Templates Selector */}
                <div className="mt-5 w-full max-w-[500px] text-left">
                  <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-white/40 mb-1.5">Template Laporan</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#07090e]/60 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl} value={tpl} className="bg-[#09090b] text-white">
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
                    <div className="text-white/30 text-[10px] px-2">{message.role === "user" ? "Anda" : "NaLI"}</div>
                    
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-xl w-full sm:w-auto sm:max-w-[85%] break-words",
                        isUser
                          ? "bg-gradient-to-r from-emerald-500/10 to-indigo-600/10 border border-white/[0.08] text-white"
                          : "bg-white/[0.03] border border-white/[0.06] text-white/90"
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
                                <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-3.5 shadow-md">
                                  <div className="flex gap-2.5">
                                    <Compass className="h-4 w-4 mt-0.5 text-indigo-400 shrink-0" />
                                    <div>
                                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80">NaLI Understanding</h4>
                                      <p className="mt-1 text-xs leading-relaxed text-white/80">{understanding}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {plan && plan.length > 0 && (
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5 shadow-md">
                                  <div className="flex gap-2.5">
                                    <Sparkles className="h-4 w-4 mt-0.5 text-emerald-400 shrink-0" />
                                    <div className="w-full">
                                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">Rencana Kerja Agensi</h4>
                                      <div className="mt-2 space-y-1.5">
                                        {plan.map((step: string, sIdx: number) => (
                                          <div key={sIdx} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                            <span className="text-xs text-white/70 font-medium leading-normal">{step}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(evidenceStrength || sourceCoverage || (missingEvidence && missingEvidence.length > 0) || (evidenceWarnings && evidenceWarnings.length > 0)) && (
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3.5 shadow-md">
                                  <div className="flex gap-2.5">
                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
                                    <div className="w-full">
                                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">NaLI Evidence Auditor</h4>
                                      
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {evidenceStrength && (
                                          <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 text-[10px] text-white/70">
                                            <span className="text-white/40 font-semibold uppercase tracking-tight">Kekuatan:</span>
                                            <span className={cn(
                                              "font-bold ml-1",
                                              evidenceStrength === "strong" && "text-emerald-400",
                                              evidenceStrength === "medium" && "text-amber-400",
                                              evidenceStrength === "weak" && "text-rose-400"
                                            )}>
                                              {evidenceStrength === "strong" ? "Kuat" : evidenceStrength === "medium" ? "Sedang" : "Lemah"}
                                            </span>
                                          </div>
                                        )}
                                        {sourceCoverage && (
                                          <div className="inline-flex items-center gap-1 rounded-lg bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 text-[10px] text-white/70">
                                            <span className="text-white/40 font-semibold uppercase tracking-tight">Sumber:</span>
                                            <span className={cn(
                                              "font-bold ml-1",
                                              sourceCoverage === "strong" && "text-emerald-400",
                                              sourceCoverage === "adequate" && "text-amber-400",
                                              sourceCoverage === "limited" && "text-rose-400"
                                            )}>
                                              {sourceCoverage === "strong" ? "Lengkap" : sourceCoverage === "adequate" ? "Cukup" : "Terbatas"}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {evidenceWarnings && evidenceWarnings.length > 0 && (
                                        <div className="mt-2.5 space-y-1 border-t border-white/[0.04] pt-2">
                                          <span className="block text-[9px] font-bold text-rose-300/80 uppercase tracking-wider">Peringatan Integritas</span>
                                          <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-white/60 leading-relaxed">
                                            {evidenceWarnings.map((warn: string, wIdx: number) => (
                                              <li key={wIdx}>{warn}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {missingEvidence && missingEvidence.length > 0 && (
                                        <div className="mt-2.5 space-y-1 border-t border-white/[0.04] pt-2">
                                          <span className="block text-[9px] font-bold text-amber-300/80 uppercase tracking-wider">Rekomendasi Bukti Tambahan</span>
                                          <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-white/60 leading-relaxed">
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

                              {isLastMessage && suggestedActions && suggestedActions.length > 0 && activeRunStatus === "idle" && (
                                <div className="mt-3 border-t border-white/[0.04] pt-2.5">
                                  <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2">Tindakan Lanjutan Yang Disarankan</span>
                                  <div className="flex flex-wrap gap-2">
                                    {suggestedActions.map((act: { label: string; prompt: string }, aIdx: number) => {
                                      const cost = getEstimatedCreditCostFromQuery(act.prompt);
                                      return (
                                        <button
                                          key={aIdx}
                                          type="button"
                                          onClick={() => handleQuickAction(act.prompt)}
                                          className="inline-flex items-center min-h-[44px] rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white transition duration-200 cursor-pointer text-left"
                                        >
                                          {act.label} ({cost})
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {isLastMessage && activeRunStatus === "idle" && (
                                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-white/35">
                                  <ArrowRight className="h-3 w-3 shrink-0 animate-pulse text-indigo-400" />
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
                      <div className="w-full mt-2">
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
                          exportReadiness={exportReadiness}
                          onUnlock={handleExportUnlock}
                          onDownload={handleDownloadExport}
                          showExport={showExportStatus}
                          exportNotice={exportNotice}
                        />

                        {/* Inline feedback prompt — shows once after first report preview */}
                        {message.type === "report_preview" && !inlineFeedbackSent && index === messages.findIndex(m => m.type === "report_preview") && (
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
                                  } catch { /* silent */ }
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
                                  } catch { /* silent */ }
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
                                className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/70 placeholder-white/25 outline-none resize-none"
                              />
                            )}
                          </div>
                        )}
                        {/* Post-output paid intent prompt — shows after feedback sent */}
                        {message.type === "report_preview" && inlineFeedbackSent && !paidIntentSent && index === messages.findIndex(m => m.type === "report_preview") && (
                          <div className="mt-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3 backdrop-blur-sm">
                            <p className="text-xs text-white/70">
                              Draft awal sudah siap. NaLI bisa membantu merapikan struktur, memperkuat bukti, dan menyiapkan versi export.
                            </p>
                            <p className="mt-2 text-xs font-medium text-white/50">
                              Jika fitur export rapi tersedia mulai Rp9.000–Rp29.000, apakah kamu tertarik?
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {(["Ya, tertarik", "Mungkin", "Belum"] as const).map((label) => (
                                <button
                                  key={label}
                                  type="button"
                                  disabled={paidIntentSending}
                                  onClick={async () => {
                                    setPaidIntentSending(true);
                                    try {
                                      const rid = report?.id || message.metadata?.new_report?.id;
                                      if (rid) {
                                        await fetch(`/api/reports/${rid}/feedback`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            rating: label === "Ya, tertarik" ? "helpful" : "not_helpful",
                                            comment: `[paid_intent] ${label}`,
                                            report_access_key: accessKey || "",
                                          }),
                                        });
                                      }
                                    } catch { /* silent */ }
                                    setPaidIntentSent(true);
                                    setPaidIntentSending(false);
                                  }}
                                  className={`inline-flex h-7 items-center rounded-lg px-3 text-[11px] font-medium transition ${
                                    label === "Ya, tertarik"
                                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                                      : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Simulated Progressive Task checklist (displayed only when running) */}
            {activeRunStatus === "running" && optimisticSteps.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                    <span className="text-sm font-semibold">NaLI sedang memproses draf...</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-white/50 pl-6">
                  {optimisticSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : step.status === "in_progress" ? (
                        <span className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-white/20 shrink-0 ml-1.5 mr-1" />
                      )}
                      <span className={cn(step.status === "completed" ? "text-emerald-400/80" : step.status === "in_progress" ? "text-white font-medium" : "text-white/40")}>
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation notifications */}
            {showValidation && (() => {
              const variant = validationIssue.severity === "error" ? "error" : "warning";
              const nextStep = validationIssue.suggestions.join(" ");
              let actionLabel: string | undefined = undefined;
              let onAction: (() => void) | undefined = undefined;

              if (validationIssue.code === "TOO_SHORT" || validationIssue.code === "EMPTY_QUERY" || validationIssue.code === "QUERY_TOO_SHORT") {
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
            {error && (() => {
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
            {notice && (
              <NaliAlert
                variant="success"
                title="Notifikasi"
                explanation={notice}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Bottom Composer and Control chips */}
        <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-[#07090e] via-[#07090e]/95 to-transparent pt-8 pb-[calc(1rem+env(safe-area-inset-bottom))] px-4 md:px-8">
          <div className="mx-auto max-w-[760px] space-y-3">
            {/* Quick Action chips (only if messages exist and thread is idle) */}
            {messages.length > 0 && activeRunStatus === "idle" && (() => {
              const actions = report?.suggested_actions && report.suggested_actions.length > 0
                ? report.suggested_actions
                : [
                    { label: "Kesimpulan Formal", prompt: "Tulis kesimpulan lebih formal" },
                    { label: "Perpendek Ringkasan", prompt: "Buat ringkasan draf di atas menjadi lebih pendek" },
                    { label: "Perkuat Temuan", prompt: "Perkuat analisis bagian temuan" },
                    { label: "Tambahkan Rekomendasi", prompt: "Tambahkan poin rekomendasi praktis" }
                  ];
              return (
                <div className="flex flex-wrap gap-2 py-1 justify-center md:justify-start">
                  {actions.map((act, i) => {
                    const cost = getEstimatedCreditCostFromQuery(act.prompt);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickAction(act.prompt)}
                        className="inline-flex items-center min-h-[44px] rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white transition duration-200 cursor-pointer"
                      >
                        {act.label} ({cost})
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Main Input Composer form */}
            {/* Insufficient credits warning */}
            {isInsufficient && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-200/80 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
                <div>
                  <p className="font-semibold text-amber-400">Kredit Energi Tidak Cukup</p>
                  <p className="mt-0.5">
                    Sisa kredit Anda ({credits} kredit) kurang dari estimasi biaya ({estCreditCost} kredit) untuk menjalankan instruksi ini.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsUpgradeOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold self-start md:self-auto"
                >
                  Upgrade / Top-up Kredit
                </Button>
              </div>
            )}

            <form
              onSubmit={messages.length === 0 ? handleInitialSubmit : handleFollowUpSubmit}
              className="relative group"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-600/10 to-indigo-400/10 opacity-30 blur-md transition duration-500 group-hover:opacity-50 group-focus-within:opacity-60" />
              
              <div className="relative flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-[#07090e]/80 p-2 min-h-[48px] sm:min-h-[56px] shadow-2xl backdrop-blur-2xl transition duration-300 focus-within:border-white/[0.15] focus-within:bg-[#07090e]">
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
                    className="w-full bg-transparent text-[14px] leading-6 text-white placeholder-white/30 outline-none border-none py-1 resize-none max-h-32 disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-1">
                  {/* Est energy cost badge */}
                  <span className="text-[10px] font-mono text-white/35 px-2">
                    Est: {estCreditCost} Kredit
                  </span>

                  <button
                    type="submit"
                    disabled={activeRunStatus === "running" || !query.trim() || isInsufficient || (messages.length === 0 && !integrityConsent) || isRateLimited}
                    aria-label="Kirim instruksi"
                    className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white text-zinc-950 transition duration-200 hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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

            {/* Model Selector */}
            {messages.length === 0 && (
              <div className="mt-3">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-white/40">
                  Profil Pemrosesan (Model)
                </span>
                <div className="flex flex-wrap gap-2">
                  {naliModels.map((model) => {
                    const isSelected = selectedModel === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model.id)}
                        className={cn(
                          "flex-1 sm:flex-none inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 min-h-[44px] cursor-pointer",
                          isSelected
                            ? "border-[#6f8057] bg-[#6f8057]/15 text-white shadow-sm shadow-[#6f8057]/10"
                            : "border-white/[0.06] bg-[#07090e]/60 text-white/40 hover:bg-white/[0.04] hover:text-white/60"
                        )}
                        aria-pressed={isSelected}
                      >
                        {model.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-white/40">
                  {selectedModel === "peregrine" && "Peregrine: cepat untuk draft awal"}
                  {selectedModel === "obsidian" && "Obsidian: lebih kuat untuk batas klaim dan struktur"}
                  {selectedModel === "zephyr" && "Zephyr: lebih halus untuk kejernihan dan gaya"}
                </p>
              </div>
            )}

            {/* Academic Integrity consent checkbox (rendered only at start or when required) */}
            {messages.length === 0 && (
              <label className="flex gap-2.5 items-start justify-center text-[12px] leading-5 text-white/40 hover:text-white/60 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={integrityConsent}
                  onChange={(e) => setIntegrityConsent(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-emerald-500 rounded border-white/20 bg-transparent focus:ring-0 focus:ring-offset-0"
                />
                <span>
                  Saya menyetujui pernyataan integritas akademik NaLI. Output adalah draf/panduan awal belajar, bukan plagiarisme atau karya akhir otomatis.
                </span>
              </label>
            )}
          </div>
        </div>
      </div>
      {/* Upgrade Modal */}
      {isUpgradeOpen && (
        <UpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
          reportId={initialReportId || (report ? report.id : null)}
          reportAccessKey={accessKey}
        />
      )}
    </div>
  );
}

/* --- Inline Report preview renderer sub-component --- */
interface ReportResultCardProps {
  report: ReportResult;
  onApply?: () => void;
  copyStatus: boolean;
  onCopy: () => void;
  exportReadiness: "export_ready" | "export_locked" | "unknown";
  onUnlock: () => void;
  onDownload: (format: "markdown" | "pdf") => void;
  showExport: boolean;
  exportNotice: string | null;
}

function ReportResultCard({
  report,
  onApply,
  copyStatus,
  onCopy,
  exportReadiness,
  onUnlock,
  onDownload,
  showExport,
  exportNotice,
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
                <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Panduan Awal</span>
                <p className="mt-1">{guide.integrity_note}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Kerangka Topik</span>
                <p className="mt-1">{guide.topic_framing}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Outline Laporan</span>
                <ul className="mt-1.5 list-decimal pl-4 space-y-1">
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
                <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Checklist Bukti yang Diperlukan</span>
                <ul className="mt-1.5 space-y-1.5">
                  {guide.evidence_checklist.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-white/35 shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Pertanyaan Observasi</span>
                <ul className="mt-1.5 space-y-1.5">
                  {guide.observation_questions.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="font-mono text-xs text-white/30 shrink-0 mt-0.5">{i+1}.</span>
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
                <span className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider">Batasan Etika & Keamanan</span>
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
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Ringkasan Singkat</span>
                <p className="mt-1">{draft.executive_summary}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Latar Belakang & Konteks</span>
                <p className="mt-1">{draft.background}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Metodologi & Bahan</span>
                <p className="mt-1">{draft.method_or_materials}</p>
              </div>
              <div className="border-t border-white/[0.04] pt-3">
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Temuan Utama</span>
                <ul className="mt-1.5 space-y-1.5">
                  {draft.findings.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <FileText className="h-4 w-4 text-white/30 shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {draft.conclusion && (
                <div className="border-t border-white/[0.04] pt-3">
                  <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Kesimpulan Sementara</span>
                  <p className="mt-1">{draft.conclusion}</p>
                </div>
              )}
            </div>
          );
        case "evidence":
          return (
            <div className="space-y-4 text-sm leading-6 text-white/70">
              <div>
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Evidence Table</span>
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
                          <td className="px-3 py-2.5 text-white/50 truncate max-w-[200px]">{row.summary}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex rounded bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/45">
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
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Catatan Sumber</span>
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
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">Confidence Note & Batasan</span>
                <p className="mt-1">{draft.uncertainty_note}</p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Checklist Review Mandiri</span>
                <ul className="space-y-1.5">
                  {draft.user_review_checklist.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <CheckCircle2 className="h-4 w-4 text-white/30 shrink-0 mt-1" />
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
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#07090e]/60 shadow-2xl backdrop-blur-xl overflow-hidden mt-3 z-10">
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
        <div className="flex flex-col">
          <span className="text-xs text-white/40">{report.report_type}</span>
          <span className="text-sm font-semibold text-white/80">{report.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {onApply && (
            <Button
              size="sm"
              onClick={onApply}
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold px-3 text-[11px] h-7 cursor-pointer"
            >
              Terapkan Perubahan
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.04] px-1 sm:px-4 text-[11px] sm:text-xs bg-white/[0.01]">
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex-1 sm:flex-initial px-2 py-3 sm:px-4 sm:py-2.5 font-medium border-b-2 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            activeTab === "preview" ? "border-emerald-400 text-white" : "border-transparent text-white/40 hover:text-white"
          )}
        >
          Isi Draft
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("evidence")}
          className={cn(
            "flex-1 sm:flex-initial px-2 py-3 sm:px-4 sm:py-2.5 font-medium border-b-2 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            activeTab === "evidence" ? "border-emerald-400 text-white" : "border-transparent text-white/40 hover:text-white"
          )}
        >
          {isGuide ? "Checklist" : "Bukti / Sumber"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("uncertainty")}
          className={cn(
            "flex-1 sm:flex-initial px-2 py-3 sm:px-4 sm:py-2.5 font-medium border-b-2 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
            activeTab === "uncertainty" ? "border-emerald-400 text-white" : "border-transparent text-white/40 hover:text-white"
          )}
        >
          Integritas & Batasan
        </button>
      </div>

      {/* Tab content panel */}
      <div className="p-5 max-h-[380px] overflow-y-auto bg-white/[0.01]">
        {renderTabContent()}
      </div>

      {/* Actions footer bar */}
      <div className="flex flex-wrap gap-2 px-4 py-3 bg-white/[0.02] border-t border-white/[0.06] text-xs">
        <Button
          size="sm"
          variant="outline"
          onClick={onCopy}
          className="h-11 sm:h-8 border-white/[0.08] hover:bg-white/[0.04] text-white/60 hover:text-white cursor-pointer"
        >
          <Clipboard className="h-3.5 w-3.5 mr-1.5" />
          {copyStatus ? "Tersalin!" : "Salin Markdown"}
        </Button>

        {exportReadiness === "export_ready" ? (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => onDownload("markdown")}
              className="h-11 sm:h-8 bg-white hover:bg-white/90 text-zinc-950 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Markdown
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload("pdf")}
              className="h-11 sm:h-8 border-white/[0.08] hover:bg-white/[0.04] text-white/60 hover:text-white cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={onUnlock}
            className="h-11 sm:h-8 bg-[#7c3aed] text-white hover:bg-[#6d28d9] cursor-pointer"
          >
            <LockKeyhole className="h-3.5 w-3.5 mr-1.5" />
            Unlock PDF (15 Kredit / Bayar)
          </Button>
        )}

        {showExport && exportNotice && (() => {
          const normalized = normalizePublicError({
            message: exportNotice,
          });
          return (
            <div className="w-full mt-2">
              <NaliAlert
                variant={normalized.severity}
                title={normalized.title}
                explanation={normalized.explanation}
                nextStep={normalized.nextStep}
              />
            </div>
          );
        })()}
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
    <div className="mb-4 rounded-2xl border border-white/[0.06] bg-[#07090e]/40 p-3 backdrop-blur-md shadow-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition cursor-pointer min-h-[44px] px-1"
      >
        <span className="flex items-center gap-1.5">
          📁 Riwayat lokal browser
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
            {snapshots.length}
          </span>
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
            const statusLabel = {
              autosaved_draft: "Autosave",
              generation_failed: "Gagal",
              draft_ready: "Siap",
              chat_updated: "Chat",
            }[item.status] || "Draft";

            const statusColors = {
              autosaved_draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
              generation_failed: "bg-red-500/10 text-red-400 border-red-500/20",
              draft_ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              chat_updated: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
            }[item.status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/[0.04] bg-white/[0.01] p-2.5 hover:bg-white/[0.02] transition"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white/80 truncate max-w-[200px]" title={item.title}>
                      {item.title}
                    </span>
                    <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase", statusColors)}>
                      {statusLabel}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">{timeStr}</span>
                  </div>
                  <p className="text-[11px] text-white/50 truncate max-w-[400px]">
                    {item.mainText || "Tidak ada materi teks."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 items-center mt-1 sm:mt-0 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRestore(item)}
                    className="inline-flex min-h-[44px] sm:min-h-[36px] items-center justify-center rounded-lg bg-white px-3 text-[11px] font-semibold text-zinc-950 hover:bg-white/90 transition cursor-pointer"
                  >
                    Pulihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => onRename(item.id, item.title)}
                    className="inline-flex min-h-[44px] sm:min-h-[36px] items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] px-3 text-[11px] font-semibold text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Ganti nama
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="inline-flex min-h-[44px] sm:min-h-[36px] items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 px-3 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer"
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
              className="inline-flex min-h-[44px] sm:min-h-[36px] items-center justify-center rounded-lg bg-white/5 border border-white/[0.06] px-3 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition cursor-pointer"
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
