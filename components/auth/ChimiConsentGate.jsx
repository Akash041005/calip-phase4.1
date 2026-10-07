"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";

const CONSENT_STORAGE_KEY = "calip_consent_accepted_v1";

const emptySubscribe = () => () => {};

function subscribeStorage(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getConsentSnapshot() {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Short, management-approved risk concepts. Final legal copy can replace
// these strings without touching layout or animation.
const LEGAL_COPY = {
  terms: {
    title: "Terms of Service",
    body: "Calip is a market-discovery product. By entering, you agree to use it lawfully and accept that listings, profiles and feeds are informational only.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "Calip never asks for private keys or seed phrases. Verify what you share before connecting anything.",
  },
  risk: {
    title: "Risk Disclaimer",
    body: "Markets involve risk, including capital loss. Nothing on Calip guarantees profits or outcomes, and nothing here is guaranteed investment advice. Information may be incomplete, delayed or third-party generated. Mutual-fund-related content carries market risk — read all documents carefully. You are responsible for your own decisions.",
  },
};

export default function ChimiConsentGate({ children }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const storedConsent = useSyncExternalStore(subscribeStorage, getConsentSnapshot, () => true);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [userAccepted, setUserAccepted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [phase, setPhase] = useState("form"); // "form" | "leaving" | "zoom"
  const [activeLegal, setActiveLegal] = useState(null);

  const hasConsent = storedConsent || userAccepted;

  function handleToggleCheck() {
    if (phase !== "form") return;
    setIsChecked((v) => !v);
  }

  function handleEnterCalip() {
    if (!isChecked || phase !== "form") return;
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    } catch {
      // Private-mode storage may throw; still allow entry for this session.
    }
    if (prefersReducedMotion) {
      setUserAccepted(true);
      return;
    }
    setPhase("leaving");
    window.setTimeout(() => setPhase("zoom"), 420);
    window.setTimeout(() => setUserAccepted(true), 1150);
  }

  if (!isClient || hasConsent) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#070a10] px-4 py-8">
      {/* Subtle ambient light around Chimi only */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6366f1]/10 blur-[80px]" />

      <div className="relative flex w-full max-w-[420px] flex-col items-center text-center">
        {/* Chimi — the visual focus; stays through the exit sequence */}
        <motion.div
          initial={false}
          animate={
            prefersReducedMotion
              ? {}
              : phase === "zoom"
                ? { scale: [1, 1.12, 7], opacity: [1, 1, 0] }
                : isChecked
                  ? { scale: 1.05 }
                  : { scale: 1 }
          }
          transition={
            phase === "zoom"
              ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
              : { type: "spring", stiffness: 400, damping: 18 }
          }
          className="relative"
        >
          <motion.img
            src="/chimi.svg"
            alt="Chimi — the Calip companion"
            width={220}
            height={220}
            draggable={false}
            animate={prefersReducedMotion ? {} : { y: [0, -6, 0] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 2.6, ease: "easeInOut" }}
            className="h-[180px] w-[180px] select-none sm:h-[220px] sm:w-[220px]"
          />
        </motion.div>

        <AnimatePresence>
          {phase === "form" && (
            <motion.div
              key="chimi-copy"
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col items-center"
            >
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#818cf8]">
                Chimi
              </p>
              <h1 className="mt-2 text-[26px] font-extrabold tracking-tight text-white sm:text-[30px]">
                Welcome to Calip.
              </h1>
              <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-[#94a3b8]">
                Discover startups. Track what matters. Decide for yourself.
              </p>

              <label className="mt-6 flex cursor-pointer select-none items-start gap-3 text-left">
                <motion.span
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onClick={handleToggleCheck}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      handleToggleCheck();
                    }
                  }}
                  animate={isChecked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-200 ${
                    isChecked
                      ? "border-[#6366f1] bg-[#6366f1] text-white"
                      : "border-[#334155] bg-transparent hover:border-[#6366f1]"
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </motion.span>
                <span className="text-[12.5px] leading-snug text-[#cbd5e1]">
                  I understand and agree to the applicable Terms, Privacy Policy and Risk
                  Disclaimers.{" "}
                  <button
                    type="button"
                    onClick={() => setActiveLegal("terms")}
                    className="font-semibold text-[#818cf8] underline underline-offset-2 hover:text-[#a5b4fc]"
                  >
                    Terms
                  </button>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setActiveLegal("privacy")}
                    className="font-semibold text-[#818cf8] underline underline-offset-2 hover:text-[#a5b4fc]"
                  >
                    Privacy
                  </button>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setActiveLegal("risk")}
                    className="font-semibold text-[#818cf8] underline underline-offset-2 hover:text-[#a5b4fc]"
                  >
                    Risks
                  </button>
                </span>
              </label>

              <button
                type="button"
                disabled={!isChecked}
                onClick={handleEnterCalip}
                className={`mt-5 inline-flex h-[46px] w-full items-center justify-center rounded-[12px] text-[14px] font-bold transition-all duration-200 sm:w-[240px] ${
                  isChecked
                    ? "bg-[#6366F1] text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:bg-[#5558e3]"
                    : "cursor-not-allowed border border-[#222c40] bg-transparent text-[#64748b]"
                }`}
              >
                Enter Calip
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {phase !== "form" && !prefersReducedMotion && (
          <span className="sr-only" role="status">
            Entering Calip…
          </span>
        )}
      </div>

      <AnimatePresence>
        {activeLegal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setActiveLegal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] rounded-[16px] border border-[#222b3d] bg-[#0d121c] p-6 text-slate-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-white">
                  {LEGAL_COPY[activeLegal].title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveLegal(null)}
                  aria-label="Close"
                  className="rounded-full p-1 text-[#94a3b8] hover:bg-[#1a2233] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#94a3b8]">
                {LEGAL_COPY[activeLegal].body}
              </p>
              <div className="mt-4 text-right">
                <button
                  type="button"
                  onClick={() => setActiveLegal(null)}
                  className="rounded-[8px] bg-[#6366F1] px-4 py-1.5 text-[12px] font-bold text-white hover:bg-[#5558e3]"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
