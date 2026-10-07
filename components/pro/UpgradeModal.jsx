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
        className="relative flex h-auto max-h-[90vh] w-full max-w-[560px] flex-col items-center overflow-y-auto rounded-[24px] sm:rounded-[30px] bg-white p-6 sm:p-10 shadow-[10px_10px_50px_10px_rgba(0,0,0,0.25)] dark:border dark:border-[#2a2e3e] dark:bg-[#181c28]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[20px] top-[20px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#f4f5f7] text-[#4b5563] transition-colors hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#2a2e3e]"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-center pt-8 pb-4 sm:pt-12 sm:pb-6 text-center">
          <h2 className="text-[28px] font-bold leading-[1.2] text-black sm:text-[36px] lg:text-[44px] dark:text-white">
            Upgraded to Calip Pro
          </h2>
          <p className="mt-[24px] sm:mt-[32px] w-full max-w-[520px] text-[16px] font-medium leading-[1.4] text-[#4b5563] sm:text-[18px] dark:text-[#b0b5bf]">
            Your subscription is now active. You have full access to&nbsp;
            AI-powered analysis, advanced portfolio analytics, and priority
            access to the best deals on Calip.
          </p>
        </div>
      </div>
    </ModalPortal>
  );
}
