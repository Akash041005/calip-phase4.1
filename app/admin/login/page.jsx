"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { adminLogin } from "../../../lib/adminApi";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Please enter your admin email and password.");
      }
      await adminLogin(email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid administrative credentials or session timeout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090a0f] px-4 py-12 text-[#f4f5fb]">
      {/* Brand & Security Header */}
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Platform
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Admin v1
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.12] bg-[#111318]/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Calip Governance Portal</h1>
              <p className="text-xs text-slate-400">Restricted administrative console</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@calip.io"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#090a0f] py-2.5 pl-10 pr-3.5 text-sm text-white outline-none focus:border-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#090a0f] py-2.5 pl-10 pr-3.5 text-sm text-white outline-none focus:border-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? "Authenticating..." : "Authorize Admin Session"}
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Quick Fill Button for testing */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("superadmin1@calip.io");
                  setPassword("SuperAdminPass123!");
                }}
                className="w-full text-center text-[11.5px] font-mono text-indigo-400 hover:text-indigo-300 transition py-1 rounded bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20"
              >
                Auto-Fill SuperAdmin Credentials
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-white/[0.08] pt-4 text-center">
            <p className="text-[11.5px] text-slate-500">
              Dual session timeouts enforced: 10-min idle / 30-min absolute. All administrative actions are recorded in immutable audit logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
