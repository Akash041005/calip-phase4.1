"use client";

import { useEffect, useState } from "react";
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
  Sliders,
  DollarSign,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("startups"); // "startups" | "fundraises" | "audit"
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingStartups: 0,
    activeFundraises: 0,
    totalVolume: 0,
    queuedJobs: 0,
  });

  // Startups State
  const [startups, setStartups] = useState([]);
  const [startupFilter, setStartupFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Fundraises State
  const [fundraises, setFundraises] = useState([]);

  // Audit Events State
  const [auditEvents, setAuditEvents] = useState([]);

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
        getAdminAuditEvents().catch((err) => {
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
      await approveAdminStartup(id, { reason: "Approved to proceed after review" });
      setActionMessage("Startup successfully approved and unlocked for listing.");
      await loadDashboardData();
      setSelectedStartup(null);
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
      setSelectedStartup(null);
    } catch (err) {
      setActionMessage(err.message || "Failed to reject startup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (id) => {
    const message = prompt("Enter specific documentation or verification details required from founder:");
    if (!message) return;
    setActionLoading(true);
    setActionMessage("");
    try {
      await requestStartupInfo(id, message);
      setActionMessage("Information request dispatched to founder.");
      await loadDashboardData();
    } catch (err) {
      setActionMessage(err.message || "Failed to request information.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleChecklist = async (startupId, key, currentValue) => {
    try {
      await toggleStartupVerification(startupId, key, !currentValue);
      // update local state
      setStartups((prev) =>
        prev.map((s) => {
          if (s._id === startupId) {
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
      if (selectedStartup && selectedStartup._id === startupId) {
        setSelectedStartup((prev) => ({
          ...prev,
          verificationChecklist: {
            ...(prev.verificationChecklist || {}),
            [key]: !currentValue,
          },
        }));
      }
    } catch (err) {
      alert("Failed to toggle verification checklist: " + err.message);
    }
  };

  const handleCloseAuction = async (id) => {
    if (!confirm("Are you sure you want to close this auction and trigger soft-cap settlement evaluation?")) return;
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
    if (!confirm("Queue asynchronous background token deployment worker job for this successful auction?")) return;
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

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5fb]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090a0f]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-white">CALIP</span>
              <span className="rounded bg-violet-600/30 px-1.5 py-0.5 text-[10px] font-bold text-violet-400 border border-violet-500/30">
                ADMIN v1
              </span>
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Base Sepolia Testnet Gateway</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{admin?.displayName || admin?.email || "Super Administrator"}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">{admin?.role || "SUPER_ADMIN"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#151824] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {(() => {
          const pendingList = startups.filter(
            (s) => (s.status || s.stage) === "pending" || (s.status || s.stage) === "under_review"
          );
          const approvedList = startups.filter(
            (s) => (s.status || s.stage) === "approved"
          );
          const rejectedList = startups.filter(
            (s) => (s.status || s.stage) === "rejected"
          );

          return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Active Admin Sessions</p>
                <p className="mt-1.5 text-xl font-bold text-white font-mono">{stats.activeAdminSessions ?? 1}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Pending Startups</p>
                <p className="mt-1.5 text-xl font-bold text-amber-400 font-mono">
                  {stats.pendingStartupDecisions ?? pendingList.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Active Presales</p>
                <p className="mt-1.5 text-xl font-bold text-emerald-400 font-mono">
                  {stats.fundraisesAtThreshold ?? fundraises.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Approved Startups</p>
                <p className="mt-1.5 text-xl font-bold text-indigo-400 font-mono">{approvedList.length}</p>
              </div>
            </div>
          );
        })()}

        {/* Action message banner */}
        {actionMessage && (
          <div className="mt-6 flex items-center justify-between rounded-xl bg-violet-600/10 border border-violet-500/30 p-4 text-sm text-violet-300">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="text-xs underline hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-3 border-b border-white/[0.08] pb-3">
          <button
            onClick={() => setActiveTab("startups")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "startups"
                ? "bg-white text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Startup Applications ({startups.length})
          </button>
          <button
            onClick={() => setActiveTab("fundraises")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "fundraises"
                ? "bg-white text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Auctions & Token Deployments
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "audit"
                ? "bg-white text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4" />
            Audit Events Trail
          </button>
          <button
            onClick={loadDashboardData}
            title="Refresh Data"
            className="ml-auto rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white hover:bg-white/[0.05]"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Tab 1: Startups Management */}
        {activeTab === "startups" && (() => {
          const pendingList = startups.filter(
            (s) => (s.status || s.stage) === "pending" || (s.status || s.stage) === "under_review"
          );
          const approvedList = startups.filter(
            (s) => (s.status || s.stage) === "approved"
          );
          const rejectedList = startups.filter(
            (s) => (s.status || s.stage) === "rejected"
          );

          const displayedStartups = startups.filter((s) => {
            const st = s.status || s.stage || "pending";
            if (startupFilter === "pending") return st === "pending" || st === "under_review";
            if (startupFilter === "approved") return st === "approved";
            if (startupFilter === "rejected") return st === "rejected";
            return true;
          });

          return (
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#111318] overflow-hidden shadow-xl">
              <div className="border-b border-white/[0.08] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Startup Applications & Dossier Queue</h2>
                  <p className="text-xs text-slate-400">Evaluate KYC, legal documentation, financials, and approve for fundraising auctions.</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[#090a0f] p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setStartupFilter("all")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      startupFilter === "all" ? "bg-white text-slate-900 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({startups.length})
                  </button>
                  <button
                    onClick={() => setStartupFilter("pending")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      startupFilter === "pending" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Pending ({pendingList.length})
                  </button>
                  <button
                    onClick={() => setStartupFilter("approved")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      startupFilter === "approved" ? "bg-emerald-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Approved ({approvedList.length})
                  </button>
                  <button
                    onClick={() => setStartupFilter("rejected")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      startupFilter === "rejected" ? "bg-rose-500 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Rejected ({rejectedList.length})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090a0f] text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
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
                  <tbody className="divide-y divide-white/[0.06] text-slate-300">
                    {displayedStartups.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          No startup applications found under "{startupFilter}" filter.
                        </td>
                      </tr>
                    ) : (
                      displayedStartups.map((s) => {
                        const id = s.id || s._id;
                        const status = s.status || s.stage || "pending";
                        const founder = s.founderName || s.reviewOwner || "Founder";
                        const sector = s.industrySector || s.sector || "General";
                        const stage = s.fundingStage || s.startupStage || "Seed";
                        const valuation = s.currentStartupValuation || s.valuation || "Not disclosed";
                        const chk = s.verificationChecklist || {};

                        return (
                          <tr key={id} className="hover:bg-white/[0.02] transition">
                            <td className="px-6 py-4">
                              <p className="font-bold text-white">{s.startupName}</p>
                              <p className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]">{id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-slate-200">{founder}</p>
                              <p className="text-[11px] text-slate-500">{s.email || "No email"}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-slate-300">
                                {stage}
                              </span>
                              <p className="mt-1 text-[11px] text-slate-500">{sector}</p>
                            </td>
                            <td className="px-6 py-4 font-mono font-semibold text-white">
                              {valuation}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                  status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : status === "under_review"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : status === "rejected"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleChecklist(id, "kycVerified", !!chk.kycVerified)}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                                    chk.kycVerified ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/[0.05] text-slate-500 border-white/[0.05]"
                                  }`}
                                >
                                  KYC {chk.kycVerified ? "✓" : "✗"}
                                </button>
                                <button
                                  onClick={() => handleToggleChecklist(id, "legalIncorporation", !!chk.legalIncorporation)}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                                    chk.legalIncorporation ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/[0.05] text-slate-500 border-white/[0.05]"
                                  }`}
                                >
                                  Legal {chk.legalIncorporation ? "✓" : "✗"}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/startups/${id}`}
                                  className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
                                >
                                  Inspect Dossier
                                </Link>
                                {status === "approved" ? (
                                  <Link
                                    href={`/insights/${id}`}
                                    target="_blank"
                                    className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                                  >
                                    View Live ↗
                                  </Link>
                                ) : (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleApprove(id)}
                                      className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    {status !== "rejected" && (
                                      <button
                                        disabled={actionLoading}
                                        onClick={() => handleReject(id)}
                                        className="rounded bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 cursor-pointer"
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
          );
        })()}

        {/* Tab 2: Fundraises & Token Deployments */}
        {activeTab === "fundraises" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-xl">
              <h2 className="text-base font-bold text-white">Auctions & Smart Contract Minting Gate</h2>
              <p className="mt-1 text-xs text-slate-400">
                Evaluate fundraising thresholds (70% soft-cap rule) and trigger the asynchronous background worker to deploy SPT utility tokens on Base L2.
              </p>

              <div className="mt-6 space-y-4">
                {fundraises.map((f, idx) => {
                  const targetVal = f.targetAmount || (f.targetMinor ? Number(f.targetMinor) / 100 : 0);
                  const raisedVal = f.raisedAmount || (f.paidMinor ? Number(f.paidMinor) / 100 : (f.committedMinor ? Number(f.committedMinor) / 100 : 0));
                  const deadlineStr = f.deadlineAt || f.deadline;
                  const deadlineDate = deadlineStr ? new Date(deadlineStr) : null;
                  const formattedDeadline = deadlineDate && !isNaN(deadlineDate.getTime()) ? deadlineDate.toLocaleDateString() : "—";
                  const sId = f.startupId?._id || f.startupId || "";

                  return (
                    <div key={f._id || f.id || `fundraise-${idx}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-white/[0.08] bg-[#090a0f] p-5 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{f.startupName || f.title || "Startup Auction Round"}</h3>
                          <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                            {f.status || "Active"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          Target: <span className="font-mono text-white font-semibold">₹{targetVal.toLocaleString("en-IN")}</span> | Raised: <span className="font-mono text-emerald-400 font-semibold">₹{raisedVal.toLocaleString("en-IN")}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500 font-mono">
                          Soft Cap Threshold: {f.thresholdPercent || 70}% | Deadline: {formattedDeadline}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {sId && (
                          <Link
                            href={`/insights/${sId}`}
                            target="_blank"
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                          >
                            Live Auction ↗
                          </Link>
                        )}
                        <button
                          onClick={() => handleCloseAuction(f._id || f.id)}
                          className="rounded-lg border border-white/[0.12] bg-[#151824] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                        >
                          Evaluate & Close
                        </button>
                        <button
                          onClick={() => handleDeployToken(f._id || f.id)}
                          className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/20"
                        >
                          Queue Token Deployment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Events */}
        {activeTab === "audit" && (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-xl">
            <h2 className="text-base font-bold text-white">Immutable Platform Audit Trail</h2>
            <p className="mt-1 text-xs text-slate-400">Every sensitive administrative operation is signed, verified, and preserved.</p>

            <div className="mt-6 divide-y divide-white/[0.06]">
              {auditEvents.map((ev, idx) => (
                <div key={ev._id || ev.id || `audit-${idx}`} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-violet-400">{ev.action}</span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-slate-300">{ev.actor}</span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-slate-500">{ev.targetId || ev.target}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {new Date(ev.timestamp || ev.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
