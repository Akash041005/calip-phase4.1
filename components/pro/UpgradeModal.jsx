"use client";

import { X } from "lucide-react";
import ModalPortal from "../ui/ModalPortal";

export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <ModalPortal
      isOpen={open}
      onClose={onClose}
      backdropClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 p-4"
      ariaLabel="Upgraded to Calip Pro"
    >
      <div
        className="relative flex h-auto max-h-[90vh] w-full max-w-[520px] flex-col items-center overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111318] p-6 sm:p-10 shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-center pt-6 pb-2 text-center">
          <div className="w-12 h-12 rounded-full border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center mb-4">
            <span className="text-emerald-400 text-xl font-bold">✓</span>
          </div>
          <h2 className="text-[24px] font-bold text-white sm:text-[30px]">
            Upgraded to Calip Pro
          </h2>
          <p className="mt-3 w-full max-w-md text-[14px] leading-relaxed text-slate-400">
            Your institutional subscription is active. You now have unlocked AI-powered diligence, real-time portfolio analytics, and priority auction tier access.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="cl-btn-primary mt-6 h-10 px-6 text-[13.5px]"
          >
            Go to Trading Desk
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
