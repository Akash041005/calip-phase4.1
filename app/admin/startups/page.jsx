"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminToken,
  getAdminStartups,
  approveAdminStartup,
  rejectAdminStartup,
} from "../../../lib/adminApi";
import {
  ArrowLeft,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminStartupsQueuePage() {
  const router = useRouter();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    loadStartups();
  }, [filterStage]);

  const loadStartups = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStage !== "all") params.stage = filterStage;
      const res = await getAdminStartups(params);
      const list = res?.data?.items ?? res?.items ?? res?.data ?? res?.startups ?? (Array.isArray(res) ? res : []);
      setStartups(Array.isArray(list) ? list : []);
    } catch {
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id, e) => {
    e.stopPropagation();
    setActionLoading(true);
    setActionMessage("");
    try {
      await approveAdminStartup(id, { reason: "Approved to proceed after review" });
      setActionMessage("Startup successfully approved!");
      await loadStartups();
    } catch (err) {
      setActionMessage(err.message || "Failed to approve startup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickReject = async (id, e) => {
    e.stopPropagation();
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    setActionLoading(true);
    setActionMessage("");
    try {
      await rejectAdminStartup(id, { reason });
      setActionMessage("Startup marked as rejected.");
      await loadStartups();
    } catch (err) {
      setActionMessage(err.message || "Failed to reject startup.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStartups = startups.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (s.startupName || "").toLowerCase();
    const founder = (s.founderName || s.reviewOwner || "").toLowerCase();
    const sector = (s.industrySector || s.sector || "").toLowerCase();
    return name.includes(q) || founder.includes(q) || sector.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5fb] pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090a0f]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" /> Admin Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-bold text-white">Startup Vetting Desk</span>
          </div>

          <button
            onClick={loadStartups}
            className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white hover:bg-white/[0.05]"
            title="Refresh Startups"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Banner Feedback */}
        {actionMessage && (
          <div className="rounded-xl bg-violet-600/10 border border-violet-500/30 p-4 text-xs font-medium text-violet-300 flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="underline hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Toolbar with Stage Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#111318] p-1.5">
            {["all", "pending", "under_review", "approved", "rejected"].map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filterStage === stage
                    ? "bg-white text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {stage.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by startup, founder, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full sm:w-[320px] rounded-lg border border-white/[0.08] bg-[#111318] pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-white transition"
            />
          </div>
        </div>

        {/* Table of Startups */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111318] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090a0f] text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Startup Name</th>
                  <th className="px-6 py-3.5 font-semibold">Founder / Submitter</th>
                  <th className="px-6 py-3.5 font-semibold">Sector & Stage</th>
                  <th className="px-6 py-3.5 font-semibold">Submission Date</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-400" />
                      Loading startup records...
                    </td>
                  </tr>
                ) : filteredStartups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                      No startup applications match the current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStartups.map((s) => {
                    const id = s.id || s._id;
                    const status = s.stage || s.status || "pending";
                    const founder = s.founderName || s.reviewOwner || "Founder";
                    const sector = s.industrySector || s.sector || "General";
                    const stage = s.fundingStage || s.startupStage || "Seed";

                    return (
                      <tr key={id} className="hover:bg-white/[0.02] transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white text-sm">{s.startupName}</p>
                          <p className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">{id}</p>
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
                        <td className="px-6 py-4 font-mono text-slate-400">
                          {new Date(s.submittedAt || s.createdAt || Date.now()).toLocaleDateString()}
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/startups/${id}`}
                              className="rounded bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
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
                              <button
                                disabled={actionLoading}
                                onClick={(e) => handleQuickApprove(id, e)}
                                className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer"
                              >
                                Approve
                              </button>
                            )}

                            {status !== "rejected" && (
                              <button
                                disabled={actionLoading}
                                onClick={(e) => handleQuickReject(id, e)}
                                className="rounded bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              >
                                Reject
                              </button>
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
      </main>
    </div>
  );
}
