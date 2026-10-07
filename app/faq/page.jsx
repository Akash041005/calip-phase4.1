"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, MessageCircle } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";
import FAQAccordion from "../../components/faq/FAQAccordion";
import { faqCategories } from "../../lib/faqs";

const categoryTabs = [
  { id: "all", name: "All" },
  ...faqCategories.map((cat) => ({ id: cat.id, name: cat.name })),
];

export default function FAQClientPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    let cats = faqCategories;

    if (activeCategory !== "all") {
      cats = cats.filter((c) => c.id === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.question.toLowerCase().includes(q) ||
              item.answer.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    return cats;
  }, [activeCategory, searchQuery]);

  const showCategoryHeaders =
    activeCategory === "all" && !searchQuery.trim();

  return (
    <>
      <Navbar activePage="faq" />

      <main className="mx-auto max-w-[1440px] px-4 pb-[80px] sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[880px] pt-[56px] sm:pt-[72px] lg:pt-[88px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:text-[#818cf8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" aria-hidden="true" />
            FAQ
          </span>

          <h1 className="mt-5 text-[28px] font-bold leading-tight text-[#1a1a2e] dark:text-white sm:text-[36px] lg:text-[44px]">
            Frequently Asked Questions
          </h1>

          <p className="mt-[14px] max-w-3xl text-[15px] leading-relaxed text-[#4b5563] dark:text-[#9ca3af] sm:text-[16px] md:text-[18px]">
            Everything you need to know about Calip, Startup Performance Tokens,
            startup onboarding, platform security, participation, and ecosystem
            features.
          </p>

          <div className="mt-[32px] max-w-2xl">
            <div className="relative">
              <Search className="absolute left-[16px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9ca3af]" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-white py-[14px] pl-[44px] pr-4 text-[14px] text-[#1a1a2e] outline-none transition-colors placeholder:text-[#9ca3af] focus:border-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:text-white dark:focus:border-[#6366f1]"
              />
            </div>
          </div>

          <div className="mt-[24px] flex flex-wrap gap-[10px]">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-full border px-[16px] py-[8px] text-[13px] font-medium transition-all duration-200 focus:outline-none ${
                  activeCategory === tab.id
                    ? "border-[#6366f1] bg-[#6366f1] text-white"
                    : "border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#6366f1] hover:text-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:text-[#b0b5bf] dark:hover:border-[#818cf8] dark:hover:text-[#818cf8]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="mt-[40px]">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, catIndex) => (
                <div key={cat.id} className={catIndex > 0 ? "mt-[40px]" : ""}>
                  {showCategoryHeaders && (
                    <div className="mb-[16px]">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6366f1] dark:text-[#818cf8]">
                        {cat.name}
                      </span>
                    </div>
                  )}
                  <FAQAccordion
                    items={cat.items}
                    defaultOpen={catIndex === 0 ? 0 : -1}
                  />
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-[15px] text-[#4b5563] dark:text-[#9ca3af]">
                  No results found for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-[12px] text-[14px] font-medium text-[#6366f1] transition-colors hover:text-[#4338ca] dark:text-[#818cf8] dark:hover:text-white"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mx-auto mt-[72px] w-full max-w-[880px]" aria-labelledby="faq-cta-heading">
          <div className="relative overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white px-6 py-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:px-14 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)",
              }}
            />

            <span className="relative inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6366f1] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:text-[#818cf8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" aria-hidden="true" />
              Still have questions?
            </span>
            <h2
              id="faq-cta-heading"
              className="relative mt-6 text-[26px] font-bold leading-tight text-[#1a1a2e] dark:text-white sm:text-[36px]"
            >
              Still Have Questions?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#4b5563] dark:text-[#9ca3af]">
              Need more information about Calip, Startup Performance Tokens,
              onboarding, or platform features?
            </p>
            <div className="relative mt-[32px] flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/founders"
                className="inline-flex items-center gap-2 rounded-full bg-[#6366f1] px-8 py-3.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#5558e3] focus:outline-none"
              >
                Register Your Startup
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-8 py-3.5 text-[14px] font-medium text-[#4b5563] transition-colors duration-200 hover:bg-[#f3f4f6] hover:text-[#1a1a2e] dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#242838] dark:hover:text-white"
              >
                <MessageCircle className="h-4 w-4 text-[#6366f1] dark:text-[#818cf8]" />
                Explore Calip
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
