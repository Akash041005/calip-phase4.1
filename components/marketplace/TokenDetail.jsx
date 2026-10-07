"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Activity, ShieldAlert } from "lucide-react";
import TokenPerformanceChart from "./TokenPerformanceChart";
import WatchlistButton from "./WatchlistButton";
import FadeUp from "../motion/FadeUp";

function timeAgo(iso) {
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function TokenDetail({ token, watched, onToggleWatch }) {
  const [participateNote, setParticipateNote] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeUp>
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
      </FadeUp>

      {/* Identity */}
      <FadeUp delay={0.05}>
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#1a2436] bg-[#0f1520] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1a2538] text-[19px] font-extrabold text-[#818cf8]">
              {token.symbol.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[24px] font-extrabold text-white">{token.name}</h1>
              <p className="font-mono text-[12.5px] text-[#94a3b8]">
                ${token.symbol} · {token.sector} · {token.stage} · Created {timeAgo(token.createdAt)}
              </p>
            </div>
          </div>
          <WatchlistButton
            startupId={token.startupId}
            startupName={token.name}
            watched={watched}
            onToggle={onToggleWatch}
          />
        </div>
      </FadeUp>

      {/* Performance */}
      <FadeUp delay={0.1}>
        <div className="mt-6 rounded-2xl border border-[#1a2436] bg-[#0f1520] p-6">
          <h2 className="text-[15px] font-bold text-white">Performance</h2>
          <div className="mt-3">
            <TokenPerformanceChart token={token} />
          </div>
        </div>
      </FadeUp>

      {/* About + founder + metrics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeUp delay={0.12} className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-[#1a2436] bg-[#0f1520] p-6">
            <h2 className="text-[15px] font-bold text-white">About the Startup</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-300">{token.about}</p>
            <div className="mt-5 border-t border-white/5 pt-4">
              <h3 className="text-[13px] font-bold text-white">Founder</h3>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-neutral-300">
                <MapPin className="h-3.5 w-3.5 text-neutral-500" /> {token.founder}
              </p>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.16}>
          <div className="flex h-full flex-col gap-3 rounded-2xl border border-[#1a2436] bg-[#0f1520] p-6">
            <h2 className="text-[15px] font-bold text-white">Startup Metrics</h2>
            {[
              { icon: Users, label: "Holders", value: token.metrics.holders.toLocaleString("en-IN") },
              { icon: Activity, label: "24h Volume", value: `₹${token.metrics.volume24h.toLocaleString("en-IN")}` },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[12.5px] text-neutral-400">
                  <m.icon className="h-4 w-4 text-[#818cf8]" /> {m.label}
                </span>
                <span className="font-mono text-[13px] font-bold text-white">{m.value}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-[11.5px] leading-relaxed text-neutral-400">
                Prototype data for design review. Markets involve risk; nothing here guarantees outcomes.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Participate placeholder */}
      <FadeUp delay={0.2}>
        <div className="mt-6 rounded-2xl border border-[#6366f1]/30 bg-[#6366f1]/5 p-6 text-center">
          <button
            type="button"
            onClick={() => setParticipateNote((v) => !v)}
            className="inline-flex h-[46px] items-center justify-center rounded-xl bg-[#6366F1] px-8 text-[14px] font-bold text-white transition hover:bg-[#5558e3]"
          >
            Invest / Participate
          </button>
          <p className="mt-2 text-[12px] text-neutral-400">
            {participateNote
              ? "Participation opens soon — this button is a design placeholder."
              : "Participation opens soon."}
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
