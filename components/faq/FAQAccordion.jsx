"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

function renderAnswer(answer) {
  const blocks = answer.split("\n\n");
  return blocks.map((block, blockIdx) => {
    const lines = block.split("\n");
    const hasBullets = lines.some((l) => l.trim().startsWith("•"));
    if (hasBullets) {
      return (
        <div key={blockIdx} className={blockIdx > 0 ? "mt-4" : ""}>
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("•")) {
              return (
                <div key={lineIdx} className="ml-1 mt-2 flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{trimmed.slice(1).trim()}</span>
                </div>
              );
            }
            return trimmed ? (
              <p key={lineIdx} className={lineIdx > 0 ? "mt-2" : ""}>
                {trimmed}
              </p>
            ) : null;
          })}
        </div>
      );
    }
    return (
      <p key={blockIdx} className={blockIdx > 0 ? "mt-4" : ""}>
        {lines.join("\n")}
      </p>
    );
  });
}

export default function FAQAccordion({ items, defaultOpen = 0, className = "" }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-xl border bg-[#111318] transition-colors duration-200 ${
              isOpen
                ? "border-white/20 shadow-md"
                : "border-white/[0.08] hover:border-white/[0.14]"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="group flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none sm:px-6"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-semibold text-white leading-snug sm:text-[16px]">
                {item.question}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                  isOpen
                    ? "border-white bg-white text-black rotate-45"
                    : "border-white/[0.1] bg-white/[0.03] text-slate-400 group-hover:text-white"
                }`}
                aria-hidden="true"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  role="region"
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-[14px] leading-relaxed text-slate-400 sm:px-6 sm:pb-6">
                    {renderAnswer(item.answer)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
