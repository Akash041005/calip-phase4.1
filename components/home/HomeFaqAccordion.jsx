"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, CircleHelp, ArrowRight } from "lucide-react";

const homeFaqs = [
  {
    q: "Do I need to connect a Web3 wallet to browse Calip?",
    a: "No! The entire platform—including live token market prices, order books, 24H volume, historical performance, Dutch auction schedules, sector analytics, and founder directories—is completely open and publicly browsable. You only need to connect a wallet when you want to execute trades, place bids in presale auctions, or register your own startup.",
  },
  {
    q: "What are Startup Performance Tokens?",
    a: "Startup Performance Tokens are liquid, fractional tokens representing synthetic economic interest in vetted early-stage companies. They trade on transparent bonding curves and peer-to-peer secondary order books settled natively on Base Layer-2.",
  },
  {
    q: "How does Calip verify startups before listing?",
    a: "All startups undergo comprehensive multi-point institutional due diligence: founder KYC verification, legal incorporation audit, verified cap table distribution, and revenue/traction proof submitted to the Calip Governance Console.",
  },
  {
    q: "Which blockchain networks are supported?",
    a: "Calip settles exclusively on Base Mainnet for sub-second trade confirmations and minimal gas fees. Users can connect with MetaMask, Coinbase Wallet, or standard Ethereum Web3 providers.",
  },
  {
    q: "How do Dutch presale auctions work?",
    a: "Primary token releases use Dutch auctions to ensure fair, manipulation-resistant price discovery. The auction starts at a ceiling price and decreases smoothly over the auction duration until the supply is cleared by participants.",
  },
];

export default function HomeFaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((cur) => (cur === idx ? -1 : idx));
  };

  return (
    <section className="mt-14 sm:mt-18 border-t border-slate-200/80 dark:border-white/[0.06] pt-14 pb-12 transition-colors">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Heading & Contact Link */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Knowledge Base
              </span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600 dark:text-zinc-400">
              Everything you need to know about Startup Performance Tokens, wallet settlement, and our public terminal.
            </p>

            <div className="mt-6 flex flex-col gap-2 text-xs">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>Read complete Documentation & FAQ</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                <span>Have an institutional question? Contact support</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Accordion */}
          <div className="lg:col-span-8 space-y-3">
            {homeFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/90 bg-white dark:border-white/[0.08] dark:bg-[#111318] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[14px] font-semibold text-slate-900 dark:text-white pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-[13px] leading-relaxed text-slate-600 dark:text-zinc-300 border-t border-slate-100 dark:border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
