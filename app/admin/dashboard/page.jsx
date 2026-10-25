"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminToken,
  getAdminSession,
  adminLogout,
  getAdminDashboardSummary,
  getAdminStartups,
  approveAdminStartup,
  rejectAdminStartup,
  requestStartupInfo,
  toggleStartupVerification,
  getAdminFundraises,
  closeAdminFundraise,
  triggerTokenCreation,
  getAdminAuditEvents,
  touchAdminActivity,
} from "../../../lib/adminApi";
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Activity,
  Search,
  Filter,
  Copy,
  Check,
  Code,
  Sparkles,
  Download,
  Info,
  Terminal,
  Calendar,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("startups"); // "startups" | "fundraises" | "audit"
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    activeAdminSessions: 1,
    pendingStartupDecisions: 0,
    fundraisesAtThreshold: 0,
    approvedStartups: 0,
  });

  // Startups State
  const [startups, setStartups] = useState([]);
  const [startupFilter, setStartupFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [startupSearch, setStartupSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Fundraises State
  const [fundraises, setFundraises] = useState([]);

  // Audit Events State
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditCategory, setAuditCategory] = useState("all"); // "all" | "auth" | "startup" | "presale" | "token"
  const [auditOutcome, setAuditOutcome] = useState("all"); // "all" | "success" | "failure"
  const [auditSearch, setAuditSearch] = useState("");
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Auth Guard & Initial Load
  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const session = getAdminSession();
    setAdmin(session);
    loadDashboardData();

    // Idle activity heartbeat (every 2 minutes)
    const interval = setInterval(() => {
      touchAdminActivity().catch(() => {});
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, spRes, frRes, audRes] = await Promise.all([
        getAdminDashboardSummary().catch((err) => {
          console.warn("getAdminDashboardSummary error:", err);
          return {};
        }),
        getAdminStartups().catch((err) => {
          console.warn("getAdminStartups error:", err);
          return {};
        }),
        getAdminFundraises().catch((err) => {
          console.warn("getAdminFundraises error:", err);
          return {};
        }),
        getAdminAuditEvents({ pageSize: 50 }).catch((err) => {
          console.warn("getAdminAuditEvents error:", err);
          return {};
        }),
      ]);

      const sumData = sumRes?.data?.counts ?? sumRes?.counts ?? sumRes?.stats ?? {};
      const spData = spRes?.data?.items ?? spRes?.items ?? spRes?.data ?? spRes?.startups ?? (Array.isArray(spRes) ? spRes : []);
      const frData = frRes?.data?.items ?? frRes?.items ?? frRes?.data ?? frRes?.fundraises ?? (Array.isArray(frRes) ? frRes : []);
      const audData = audRes?.data?.items ?? audRes?.items ?? audRes?.data ?? audRes?.events ?? (Array.isArray(audRes) ? audRes : []);

      setStats(sumData);
      if (Array.isArray(spData)) setStartups(spData);
      if (Array.isArray(frData)) setFundraises(frData);
      if (Array.isArray(audData)) setAuditEvents(audData);
      setLastRefreshed(new Date());
    } catch (err) {
      setActionMessage("Error loading admin data: " + (err.message || "Session error"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    router.replace("/admin/login");
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    setActionMessage("");
    try {
      await approveAdminStartup(id, { reason: "Approved to proceed after administrative review" });
      setActionMessage("Startup successfully approved and unlocked for community presale.");
      await loadDashboardData();
    } catch (err) {
      setActionMessage(err.message || "Failed to approve startup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rationale for rejecting this startup submission:");
    if (!reason) return;
    setActionLoading(true);
    setActionMessage("");
    try {
      await rejectAdminStartup(id, { reason });
      setActionMessage("Startup submission marked as rejected.");
      await loadDashboardData();
    } catch (err) {
      setActionMessage(err.message || "Failed to reject startup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleChecklist = async (startupId, key, currentValue) => {
    try {
      await toggleStartupVerification(startupId, key, !currentValue);
      setStartups((prev) =>
        prev.map((s) => {
          if (s._id === startupId || s.id === startupId) {
            return {
              ...s,
              verificationChecklist: {
                ...(s.verificationChecklist || {}),
                [key]: !currentValue,
              },
            };
          }
          return s;
        })
      );
    } catch (err) {
      alert("Failed to update verification checklist: " + err.message);
    }
  };

  const handleCloseAuction = async (id) => {
    if (!confirm("Are you sure you want to close this auction and trigger 70% soft-cap evaluation?")) return;
    setActionLoading(true);
    try {
      await closeAdminFundraise(id);
      alert("Fundraise round closed successfully.");
      await loadDashboardData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeployToken = async (id) => {
    if (!confirm("Queue asynchronous background token deployment worker job on Base Sepolia for this auction?")) return;
    setActionLoading(true);
    try {
      const res = await triggerTokenCreation(id);
      alert(`Token creation job successfully queued! Job ID: ${res.jobId || "N/A"}`);
      await loadDashboardData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAuditLogsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `calip_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Startups
  const pendingStartups = useMemo(() => {
    return startups.filter(
      (s) => (s.status || s.stage) === "pending" || (s.status || s.stage) === "under_review"
    );
  }, [startups]);

  const approvedStartups = useMemo(() => {
    return startups.filter((s) => (s.status || s.stage) === "approved");
  }, [startups]);

  const rejectedStartups = useMemo(() => {
    return startups.filter((s) => (s.status || s.stage) === "rejected");
  }, [startups]);

  const filteredStartups = useMemo(() => {
    return startups.filter((s) => {
      const st = s.status || s.stage || "pending";
      const matchesFilter =
        startupFilter === "all" ||
        (startupFilter === "pending" && (st === "pending" || st === "under_review")) ||
        (startupFilter === "approved" && st === "approved") ||
        (startupFilter === "rejected" && st === "rejected");

      if (!matchesFilter) return false;

      if (!startupSearch.trim()) return true;
      const q = startupSearch.toLowerCase();
      return (
        (s.startupName && s.startupName.toLowerCase().includes(q)) ||
        (s.founderName && s.founderName.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.industrySector && s.industrySector.toLowerCase().includes(q)) ||
        (s._id && s._id.toLowerCase().includes(q))
      );
    });
  }, [startups, startupFilter, startupSearch]);

  // Filtered Audit Events
  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter((ev) => {
      const act = (ev.action || "").toLowerCase();
      const res = (ev.resourceType || "").toLowerCase();

      // Category filter
      if (auditCategory === "auth" && !act.startsWith("auth.")) return false;
      if (auditCategory === "startup" && !act.startsWith("startup.") && res !== "startup") return false;
      if (auditCategory === "presale" && !act.startsWith("presale.") && !act.includes("auction") && res !== "presale") return false;
      if (auditCategory === "token" && !act.startsWith("token.") && res !== "token") return false;

      // Outcome filter
      if (auditOutcome === "success" && (ev.outcome || "success") !== "success") return false;
      if (auditOutcome === "failure" && (ev.outcome || "success") !== "failure") return false;

      // Search filter
      if (!auditSearch.trim()) return true;
      const q = auditSearch.toLowerCase();
      return (
        act.includes(q) ||
        (ev.actorEmail && ev.actorEmail.toLowerCase().includes(q)) ||
        (ev.actorRole && ev.actorRole.toLowerCase().includes(q)) ||
        (ev.resourceId && ev.resourceId.toLowerCase().includes(q)) ||
        (ev.reason && ev.reason.toLowerCase().includes(q)) ||
        (ev.ip && ev.ip.toLowerCase().includes(q)) ||
        (ev.requestId && ev.requestId.toLowerCase().includes(q))
      );
    });
  }, [auditEvents, auditCategory, auditOutcome, auditSearch]);

  // Action badge styling helper
  const getActionBadge = (actionStr = "") => {
    const act = actionStr.toLowerCase();
    if (act.startsWith("auth.")) {
      return { label: "AUTH", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" };
    }
    if (act.startsWith("startup.")) {
      return { label: "VENTURE", bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" };
    }
    if (act.startsWith("presale.") || act.includes("auction")) {
      return { label: "AUCTION", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
    }
    if (act.startsWith("token.")) {
      return { label: "TOKEN", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" };
    }
    return { label: "SYSTEM", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };
  };

  // Relative time helper
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#f4f5fb] selection:bg-violet-600/30">
      {/* Top Modern Admin Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#07080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="text-base font-black tracking-wider text-white group-hover:text-violet-400 transition">
                CALIP
              </span>
              <span className="rounded-md bg-gradient-to-r from-violet-600/30 to-indigo-600/30 px-2 py-0.5 text-[10.5px] font-mono font-bold text-violet-300 border border-violet-500/30 shadow-xs">
                GOVERNANCE v1
              </span>
            </Link>
            <span className="text-zinc-700 hidden sm:inline">/</span>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.06]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span>Base Sepolia Gateway (L2)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border border-violet-500/30 flex items-center justify-center text-xs font-bold font-mono text-violet-300">
                {(admin?.displayName || admin?.email || "SA").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200">
                  {admin?.displayName || admin?.email || "Super Administrator"}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                  {admin?.role || "SUPER_ADMIN"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#12141c] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition cursor-pointer"
              title="Sign Out of Admin Console"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Metric Overview Cards (Glassmorphism + Dynamic Accent Glows) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#11131a] to-[#0c0d14] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Active Admin Sessions
              </span>
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-white font-mono">
              {stats.activeAdminSessions ?? 1}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              TLS 1.3 Authenticated
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#11131a] to-[#0c0d14] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Pending Dossier Queue
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-amber-400 font-mono">
              {stats.pendingStartupDecisions ?? pendingStartups.length}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-mono">
              {pendingStartups.length > 0 ? "Requires admin review" : "Queue completely cleared"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#11131a] to-[#0c0d14] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Active Presales (Base L2)
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-emerald-400 font-mono">
              {fundraises.length}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-mono">
              70% Soft-Cap Gate Enforced
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#11131a] to-[#0c0d14] p-5 shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Approved Ventures
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-indigo-400 font-mono">
              {approvedStartups.length}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-mono">
              Vetted for live auctions
            </p>
          </div>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div className="flex items-center justify-between rounded-2xl bg-violet-600/10 border border-violet-500/30 p-4 text-sm text-violet-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage("")}
              className="text-xs text-violet-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Segmented Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("startups")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === "startups"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Startup Applications</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === "startups" ? "bg-zinc-900 text-white" : "bg-white/10 text-zinc-300"
                }`}
              >
                {startups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("fundraises")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === "fundraises"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Auctions & Token Gate</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === "fundraises" ? "bg-zinc-900 text-white" : "bg-white/10 text-zinc-300"
                }`}
              >
                {fundraises.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === "audit"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Audit Events Trail</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === "audit" ? "bg-zinc-900 text-white" : "bg-white/10 text-zinc-300"
                }`}
              >
                {auditEvents.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
            {lastRefreshed && (
              <span className="hidden md:inline">
                Synced {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button
              onClick={loadDashboardData}
              title="Refresh Dashboard Data"
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#12141c] px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: STARTUP APPLICATIONS & DOSSIER QUEUE
           ========================================================================= */}
        {activeTab === "startups" && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15] overflow-hidden shadow-2xl">
            {/* Header Toolbar & Search */}
            <div className="border-b border-white/[0.08] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0c12]">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Startup Applications & Dossier Queue</span>
                  <span className="rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-mono">
                    Evaluation Gate
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Inspect founder dossiers, verify KYC/Legal incorporation compliance, and approve for fundraising auctions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={startupSearch}
                    onChange={(e) => setStartupSearch(e.target.value)}
                    placeholder="Search venture, founder, sector…"
                    className="w-full sm:w-60 rounded-xl border border-white/[0.08] bg-[#141620] pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setStartupFilter("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      startupFilter === "all" ? "bg-white text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    All ({startups.length})
                  </button>
                  <button
                    onClick={() => setStartupFilter("pending")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      startupFilter === "pending" ? "bg-amber-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Pending ({pendingStartups.length})
                  </button>
                  <button
                    onClick={() => setStartupFilter("approved")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      startupFilter === "approved" ? "bg-emerald-400 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Approved ({approvedStartups.length})
                  </button>
                  <button
                    onClick={() => setStartupFilter("rejected")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      startupFilter === "rejected" ? "bg-rose-500 text-white font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Rejected ({rejectedStartups.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Startups Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090b10] text-zinc-400 uppercase tracking-wider border-b border-white/[0.07] text-[10.5px]">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Venture</th>
                    <th className="px-6 py-3.5 font-semibold">Founder</th>
                    <th className="px-6 py-3.5 font-semibold">Stage & Sector</th>
                    <th className="px-6 py-3.5 font-semibold">Valuation</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Compliance Checklist</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                  {filteredStartups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center text-zinc-500">
                        No startup applications found matching your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStartups.map((s) => {
                      const id = s.id || s._id;
                      const status = s.status || s.stage || "pending";
                      const founder = s.founderName || s.reviewOwner || "Founder";
                      const sector = s.industrySector || s.sector || "General";
                      const stage = s.fundingStage || s.startupStage || "Seed";
                      const valuation = s.currentStartupValuation || s.valuation || "Under ₹1 Cr";
                      const chk = s.verificationChecklist || {};

                      return (
                        <tr key={id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                                {(s.startupName || "ST").slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{s.startupName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10.5px] text-zinc-500 font-mono">
                                    {id.slice(0, 8)}...{id.slice(-4)}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(id, `id-${id}`)}
                                    className="text-zinc-600 hover:text-zinc-300"
                                    title="Copy full ID"
                                  >
                                    {copiedId === `id-${id}` ? (
                                      <Check className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-zinc-200 font-medium">{founder}</p>
                            <p className="text-[11px] text-zinc-500">{s.email || "No email"}</p>
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                              {stage}
                            </span>
                            <p className="mt-1 text-[11px] text-zinc-400 font-medium">{sector}</p>
                          </td>

                          <td className="px-6 py-4 font-mono font-semibold text-white">
                            {valuation}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${
                                status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : status === "rejected"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  status === "approved"
                                    ? "bg-emerald-400"
                                    : status === "rejected"
                                    ? "bg-rose-400"
                                    : "bg-amber-400 animate-ping"
                                }`}
                              />
                              {status}
                            </span>
                          </td>

                          {/* Refined Compliance Checklist with Interactive Indicators */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleToggleChecklist(id, "kycVerified", !!chk.kycVerified)}
                                title="Click to toggle KYC verification status"
                                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold border transition cursor-pointer ${
                                  chk.kycVerified
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-white/[0.04] text-zinc-500 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-300"
                                }`}
                              >
                                {chk.kycVerified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                <span>KYC</span>
                              </button>

                              <button
                                onClick={() => handleToggleChecklist(id, "legalIncorporation", !!chk.legalIncorporation)}
                                title="Click to toggle Legal Incorporation status"
                                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold border transition cursor-pointer ${
                                  chk.legalIncorporation
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-white/[0.04] text-zinc-500 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-300"
                                }`}
                              >
                                {chk.legalIncorporation ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                <span>Legal</span>
                              </button>

                              <button
                                onClick={() => handleToggleChecklist(id, "financialProof", !!chk.financialProof)}
                                title="Click to toggle Financial Statements verification"
                                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold border transition cursor-pointer ${
                                  chk.financialProof
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-white/[0.04] text-zinc-500 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-300"
                                }`}
                              >
                                {chk.financialProof ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                <span>Financials</span>
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/startups/${id}`}
                                className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition"
                              >
                                <FileText className="h-3 w-3" />
                                <span>Inspect Dossier</span>
                              </Link>

                              {status === "approved" ? (
                                <Link
                                  href={`/insights/${id}`}
                                  target="_blank"
                                  className="flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                                >
                                  <span>View Live</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              ) : (
                                <>
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleApprove(id)}
                                    className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  {status !== "rejected" && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleReject(id)}
                                      className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition cursor-pointer disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: AUCTIONS & SMART CONTRACT MINTING GATE
           ========================================================================= */}
        {activeTab === "fundraises" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15] p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Auctions & Smart Contract Minting Gate</span>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">
                      70% Soft-Cap Rule
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    Smart-contract escrow rounds on Base Sepolia. When an auction reaches or exceeds the 70% soft-cap, tokens become eligible for background minting and investor allocation.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {fundraises.length === 0 ? (
                  <div className="py-14 text-center text-zinc-500 text-xs">
                    No active community auction rounds currently registered.
                  </div>
                ) : (
                  fundraises.map((f, idx) => {
                    const targetVal = f.targetAmount || (f.targetMinor ? Number(f.targetMinor) / 100 : 0);
                    const raisedVal = f.raisedAmount || (f.paidMinor ? Number(f.paidMinor) / 100 : (f.committedMinor ? Number(f.committedMinor) / 100 : 0));
                    const softCapVal = targetVal * 0.7; // canonical 70% platform rule
                    const progressPercent = targetVal > 0 ? Math.min(100, (raisedVal / targetVal) * 100) : 0;
                    const isSoftCapMet = raisedVal >= softCapVal && softCapVal > 0;
                    const deadlineStr = f.deadlineAt || f.deadline;
                    const deadlineDate = deadlineStr ? new Date(deadlineStr) : null;
                    const formattedDeadline = deadlineDate && !isNaN(deadlineDate.getTime()) ? deadlineDate.toLocaleDateString() : "10/31/2026";
                    const sId = f.startupId?._id || f.startupId || "";

                    return (
                      <div
                        key={f._id || f.id || `fundraise-${idx}`}
                        className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0e1017] to-[#090b10] p-6 shadow-xl space-y-4 hover:border-white/15 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-base font-bold text-white">
                                {f.startupName || f.title || "Startup Auction Round"}
                              </h3>
                              <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase">
                                {f.status || "Active"}
                              </span>
                              {isSoftCapMet && (
                                <span className="rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                                  ✓ Soft-Cap Reached
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">
                              Round ID: <span className="font-mono text-zinc-300">{f._id || f.id}</span> • Deadline: <span className="font-mono text-zinc-300">{formattedDeadline}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {sId && (
                              <Link
                                href={`/insights/${sId}`}
                                target="_blank"
                                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                              >
                                <span>Live Auction</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                            <button
                              onClick={() => handleCloseAuction(f._id || f.id)}
                              className="rounded-xl border border-white/[0.12] bg-[#151824] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                            >
                              Evaluate & Close
                            </button>
                            <button
                              onClick={() => handleDeployToken(f._id || f.id)}
                              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-600/25 cursor-pointer"
                            >
                              Queue Token Deployment
                            </button>
                          </div>
                        </div>

                        {/* Financial Metrics Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/20 p-3.5 rounded-xl border border-white/[0.04]">
                          <div>
                            <span className="text-[10.5px] uppercase font-semibold text-zinc-500">Target Raise</span>
                            <p className="font-mono font-bold text-white text-sm mt-0.5">
                              ₹{targetVal.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10.5px] uppercase font-semibold text-zinc-500">Amount Raised</span>
                            <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                              ₹{raisedVal.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10.5px] uppercase font-semibold text-zinc-500">70% Soft Cap Gate</span>
                            <p className="font-mono font-bold text-indigo-400 text-sm mt-0.5">
                              ₹{softCapVal.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10.5px] uppercase font-semibold text-zinc-500">Auction Progress</span>
                            <p className="font-mono font-bold text-white text-sm mt-0.5">
                              {progressPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Interactive Progress Bar with 70% Gate Marker */}
                        <div className="space-y-1.5 pt-1">
                          <div className="relative h-2.5 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-white/[0.06]">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                            {/* 70% Soft Cap Marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                              style={{ left: "70%" }}
                              title="70% Soft Cap Gate"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10.5px] font-mono text-zinc-500">
                            <span>₹0</span>
                            <span className="text-amber-400/90 font-semibold">| 70% Soft Cap Gate</span>
                            <span>₹{targetVal.toLocaleString("en-IN")} Hard Cap</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: IMMUTABLE PLATFORM AUDIT TRAIL (COMPREHENSIVE & DETAILED)
           ========================================================================= */}
        {activeTab === "audit" && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15] overflow-hidden shadow-2xl space-y-4">
            {/* Header & Controls */}
            <div className="border-b border-white/[0.08] px-6 py-5 bg-[#0a0c12] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-violet-400" />
                    <span>Immutable Platform Audit Trail</span>
                    <span className="rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 text-[10px] font-mono">
                      WORM Compliance
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Cryptographically preserved ledger of administrative logins, status transitions, auction launches, and smart contract worker dispatches.
                  </p>
                </div>

                <button
                  onClick={exportAuditLogsJSON}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#141620] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/[0.06] transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-violet-400" />
                  <span>Export Audit Logs (JSON)</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search by actor, action, resource ID, IP, or reason…"
                    className="w-full rounded-xl border border-white/[0.08] bg-[#141620] pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition font-mono"
                  />
                </div>

                {/* Filter Pills: Categories */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => setAuditCategory("all")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditCategory === "all" ? "bg-white text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      All ({auditEvents.length})
                    </button>
                    <button
                      onClick={() => setAuditCategory("auth")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditCategory === "auth" ? "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Auth
                    </button>
                    <button
                      onClick={() => setAuditCategory("startup")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditCategory === "startup" ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Ventures
                    </button>
                    <button
                      onClick={() => setAuditCategory("presale")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditCategory === "presale" ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Auctions
                    </button>
                  </div>

                  {/* Outcome Filter */}
                  <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => setAuditOutcome("all")}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditOutcome === "all" ? "bg-zinc-700 text-white font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAuditOutcome("success")}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditOutcome === "success" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Success
                    </button>
                    <button
                      onClick={() => setAuditOutcome("failure")}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                        auditOutcome === "failure" ? "bg-rose-500/20 text-rose-400 font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Records List */}
            <div className="divide-y divide-white/[0.06] px-4 sm:px-6 pb-6">
              {filteredAuditEvents.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs">
                  No audit log records found matching the current search and filter parameters.
                </div>
              ) : (
                filteredAuditEvents.map((ev, idx) => {
                  const evId = ev._id || ev.id || `audit-${idx}`;
                  const isExpanded = expandedEventId === evId;
                  const badge = getActionBadge(ev.action);
                  const actorEmail = ev.actorEmail || ev.actor || "admin@calip.io";
                  const actorRole = ev.actorRole || "Admin";
                  const resourceType = ev.resourceType || ev.entity || "system";
                  const resourceId = ev.resourceId || ev.targetId || "";
                  const outcome = ev.outcome || "success";
                  const timestampStr = ev.timestamp || ev.createdAt;
                  const formattedDate = timestampStr ? new Date(timestampStr).toLocaleString() : "—";
                  const relativeTime = formatRelativeTime(timestampStr);
                  const reason = ev.reason || "";

                  return (
                    <div
                      key={evId}
                      className="py-4 hover:bg-white/[0.015] transition rounded-xl px-3 group"
                    >
                      {/* Main Summary Line */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Category Tag */}
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>

                          {/* Specific Action Name */}
                          <span className="font-mono font-bold text-white text-sm">
                            {ev.action}
                          </span>

                          {/* Outcome Pill */}
                          <span
                            className={`rounded-full px-2 py-0.2 text-[9.5px] font-mono font-bold uppercase ${
                              outcome === "success"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {outcome}
                          </span>

                          {/* Actor Email & Role */}
                          <span className="text-zinc-400 flex items-center gap-1.5 font-mono">
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-300 font-semibold">{actorEmail}</span>
                            <span className="text-[10px] text-zinc-500">({actorRole})</span>
                          </span>

                          {/* Target Resource */}
                          {resourceId && (
                            <span className="text-zinc-400 flex items-center gap-1.5 font-mono">
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-500 uppercase text-[10px]">{resourceType}:</span>
                              <span className="text-violet-300 font-semibold">{resourceId.slice(0, 10)}...</span>
                            </span>
                          )}
                        </div>

                        {/* Right Side: Timestamp & Expand Toggle */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2 text-right">
                            <span className="text-zinc-300 font-mono text-[11px]">{formattedDate}</span>
                            <span className="text-zinc-500 text-[10px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
                              {relativeTime}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedEventId(isExpanded ? null : evId)}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#141620] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                          >
                            <Terminal className="h-3 w-3 text-violet-400" />
                            <span>{isExpanded ? "Collapse" : "Inspect Payload"}</span>
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Optional Context/Reason Note */}
                      {reason && (
                        <p className="mt-1.5 text-xs text-zinc-400 font-sans italic pl-1 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          <span>{reason}</span>
                        </p>
                      )}

                      {/* Expandable Cryptographic Payload Inspector */}
                      {isExpanded && (
                        <div className="mt-3.5 rounded-xl border border-white/[0.08] bg-[#07080c] p-4 text-xs font-mono space-y-3 shadow-inner">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2 text-[11px] text-zinc-400">
                            <div className="flex items-center gap-4">
                              <span>
                                Request ID: <span className="text-violet-300">{ev.requestId || "—"}</span>
                              </span>
                              <span>
                                IP Source: <span className="text-emerald-400">{ev.ip || "127.0.0.1"}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(ev, null, 2), `raw-${evId}`)}
                              className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer"
                            >
                              {copiedId === `raw-${evId}` ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy Raw JSON</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Before State */}
                            <div className="rounded-lg bg-black/40 border border-white/[0.04] p-3">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                                Prior State (Before)
                              </span>
                              <pre className="text-[11px] text-zinc-400 overflow-x-auto max-h-40">
                                {ev.before ? JSON.stringify(ev.before, null, 2) : "null (initial submission)"}
                              </pre>
                            </div>

                            {/* After State */}
                            <div className="rounded-lg bg-black/40 border border-white/[0.04] p-3">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                                Applied State (After)
                              </span>
                              <pre className="text-[11px] text-emerald-400/90 overflow-x-auto max-h-40">
                                {ev.after ? JSON.stringify(ev.after, null, 2) : "null (no mutation recorded)"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
