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
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f1]" />
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
    <div className={`space-y-[12px] ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-[16px] border bg-white transition-colors duration-300 dark:bg-[#181c28] ${
              isOpen
                ? "border-[#c7d2fe] shadow-[0_4px_24px_rgba(99,102,241,0.10)] dark:border-[#3730a3]"
                : "border-[#f0f0f0] dark:border-[#242838]"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="group flex w-full items-center justify-between gap-4 p-[20px] text-left focus:outline-none sm:px-[24px]"
              aria-expanded={isOpen}
            >
              <span
                className={`text-[15px] font-semibold leading-snug transition-colors duration-200 sm:text-[16px] ${
                  isOpen
                    ? "text-[#4338ca] dark:text-[#818cf8]"
                    : "text-[#1a1a2e] dark:text-white"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isOpen
                    ? "border-[#6366f1] bg-[#6366f1] text-white rotate-45"
                    : "border-[#e5e7eb] text-[#6b7280] group-hover:border-[#6366f1] group-hover:text-[#6366f1] dark:border-[#2a2e3e] dark:text-[#9ca3af] dark:group-hover:border-[#818cf8] dark:group-hover:text-[#818cf8]"
                }`}
                aria-hidden="true"
              >
                <Plus className="h-[16px] w-[16px]" strokeWidth={2} />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  role="region"
                  className="overflow-hidden"
                >
                  <div className="px-[20px] pb-[20px] text-[14px] leading-relaxed text-[#374151] dark:text-[#b0b5bf] sm:px-[24px] sm:pb-[24px]">
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
