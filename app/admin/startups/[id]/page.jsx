"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminToken,
  getAdminStartupDetail,
  approveAdminStartup,
  rejectAdminStartup,
  requestStartupInfo,
  toggleStartupVerification,
} from "../../../../lib/adminApi";
import {
  ArrowLeft,
  Building2,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Loader2,
  User,
  Mail,
  Globe,
  DollarSign,
  Layers,
} from "lucide-react";

export default function StartupDossierPage() {
  const params = useParams();
  const router = useRouter();
  const startupId = params?.id;

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState("Vetted and approved for fundraising presale");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    loadStartup();
  }, [startupId]);

  const loadStartup = async () => {
    if (!startupId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getAdminStartupDetail(startupId);
      const data = res?.data ?? res?.startup ?? res;
      if (!data) throw new Error("Startup dossier not found");
      setStartup(data);
    } catch (err) {
      setError(err.message || "Failed to load startup dossier.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setActionSuccess("");
    setActionError("");
    try {
      await approveAdminStartup(startupId, {
        reason: approveRemarks.trim() || "Approved to proceed after review",
        version: startup?.__v,
      });
      setActionSuccess("Startup successfully approved! The presale and token setup are now unlocked.");
      setShowApproveModal(false);
      await loadStartup();
    } catch (err) {
      setActionError(err.message || "Failed to approve startup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError("A formal rejection reason is required.");
      return;
    }
    setActionLoading(true);
    setActionSuccess("");
    setActionError("");
    try {
      await rejectAdminStartup(startupId, {
        reason: rejectReason.trim(),
        version: startup?.__v,
      });
      setActionSuccess("Startup application marked as rejected.");
      setShowRejectModal(false);
      await loadStartup();
    } catch (err) {
      setActionError(err.message || "Failed to reject startup.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0f] text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-indigo-400" />
        <span className="text-sm font-mono">Loading Startup Dossier...</span>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen bg-[#090a0f] px-6 py-12 text-[#f4f5fb] flex flex-col items-center justify-center">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 max-w-md text-center">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Dossier Unavailable</h2>
          <p className="mt-2 text-xs text-slate-400">{error || "Could not retrieve startup details."}</p>
          <Link
            href="/admin/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = startup.status || startup.stage || "pending";
  const pitchDeckUrl = startup.pitchDeck || startup.pitchDeckUrl || startup.pitchDeckPath;
  const logoUrl = startup.startupLogo || startup.logo;

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5fb] pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090a0f]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Review Queue
          </Link>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                status === "approved"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : status === "rejected"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {status}
            </span>

            {status !== "approved" && (
              <button
                onClick={() => setShowApproveModal(true)}
                className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer shadow-md"
              >
                Approve Startup
              </button>
            )}

            {status !== "rejected" && (
              <button
                onClick={() => setShowRejectModal(true)}
                className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/30 transition cursor-pointer"
              >
                Reject Application
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Dossier */}
      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 space-y-6">
        {/* Feedback Banners */}
        {actionSuccess && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-medium text-emerald-300 flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess("")} className="underline hover:text-white">Dismiss</button>
          </div>
        )}
        {actionError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs font-medium text-rose-300 flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError("")} className="underline hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Hero Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={startup.startupName}
                  className="h-16 w-16 rounded-2xl object-cover border border-white/10 bg-black/40"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xl font-bold">
                  {startup.startupName?.slice(0, 2).toUpperCase() || "ST"}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {startup.startupName}
                </h1>
                <p className="mt-1 text-xs text-slate-400 font-mono">
                  ID: {startup._id || startup.id} • Registered: {new Date(startup.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-1 text-xs text-slate-300 font-medium">
                {startup.industrySector || "Tech"}
              </span>
              <span className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-1 text-xs text-slate-300 font-medium">
                {startup.fundingStage || "Seed Stage"}
              </span>
              {startup.startupWebsite && (
                <a
                  href={startup.startupWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20"
                >
                  <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-6">
            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Executive Summary</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {startup.description || "No company description supplied by founder."}
            </p>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Founder & Pitch Deck */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pitch Deck Section */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Pitch Deck & Supporting Documentation</h3>
                </div>
                {pitchDeckUrl && (
                  <a
                    href={pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Open PDF Deck <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {pitchDeckUrl ? (
                <div className="rounded-xl border border-white/[0.08] bg-[#090a0f] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Founder Pitch Deck</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-[420px]">{pitchDeckUrl}</p>
                    </div>
                  </div>
                  <a
                    href={pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Download / View
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#090a0f] p-6 text-center text-xs text-slate-500">
                  No pitch deck document attached to this application.
                </div>
              )}
            </div>

            {/* Founder Credentials Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4">
                <User className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Founder Identity & Contact Info</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Founder Name</span>
                  <p className="mt-1 text-sm font-bold text-white">{startup.founderName || "Not disclosed"}</p>
                </div>
                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Contact Email</span>
                  <p className="mt-1 text-sm font-bold text-white">{startup.email || "Not disclosed"}</p>
                </div>
                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Phone / Mobile</span>
                  <p className="mt-1 text-sm font-mono text-slate-300">{startup.mobileNumber || "Not disclosed"}</p>
                </div>
                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">LinkedIn Profile</span>
                  <p className="mt-1 text-sm truncate">
                    {startup.linkedInProfile ? (
                      <a href={startup.linkedInProfile} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                        {startup.linkedInProfile}
                      </a>
                    ) : (
                      <span className="text-slate-500">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fundraising & Utility Metrics */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Fundraising Target & Valuation</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Target Raise Goal</span>
                  <p className="mt-1 text-xl font-bold font-mono text-emerald-400">
                    {startup.targetGoal || startup.fundraisingGoal || "10.0 ETH"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Current Startup Valuation</span>
                  <p className="mt-1 text-lg font-bold font-mono text-white">
                    {startup.currentStartupValuation || "$1,000,000"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#090a0f] border border-white/[0.06] p-4">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Legal Structure</span>
                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {startup.companyRegistrationType || "Delaware C-Corp / LLC"}
                  </p>
                </div>
              </div>
            </div>

            {/* Utility Token Preview */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 shadow-xl">
              <div className="flex items-center gap-2.5 mb-4">
                <Layers className="h-5 w-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Token Utility Specification</h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Per Calip SRS Section 8.5 & FR-052, token benefits represent software access, VIP demo days, discounts, and community perks—not equity stock.
              </p>

              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4 text-xs text-violet-300">
                <p className="font-semibold text-white mb-1">Stated Backer Utility:</p>
                <p className="leading-relaxed">
                  {startup.tokenUtility || startup.utilityStatement || "Early platform beta access, monthly founder townhalls, and VIP product discounts."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-[#11151f] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Approve Startup Application
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Approving this startup changes its status to <strong className="text-emerald-300">Approved</strong> in MongoDB, creates an immutable audit event, and immediately unlocks fundraising auction creation on Base Sepolia.
            </p>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Approval Remarks / Justification
              </label>
              <textarea
                rows={3}
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#090a0f] p-3 text-xs text-white outline-none focus:border-emerald-400 transition"
                placeholder="Pitch deck verified, founder identity confirmed..."
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Processing Approval..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#11151f] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-rose-400" />
              Reject Startup Application
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Rejecting this startup application marks it as <strong className="text-rose-300">Rejected</strong>. The founder will see this rationale in their dashboard.
            </p>

            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Mandatory Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#090a0f] p-3 text-xs text-white outline-none focus:border-rose-400 transition"
                placeholder="Incomplete pitch deck, unverified business registration..."
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={handleReject}
                className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-400 transition cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Processing Rejection..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
