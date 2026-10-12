"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, MessageCircle } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";
import FAQAccordion from "../../components/faq/FAQAccordion";
import { faqCategories } from "../../lib/faqs";

import Footer from "../../components/dashboard/Footer";

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f4f5fb] transition-colors">
      <Navbar activePage="faq" />

      <main className="mx-auto max-w-[1440px] px-4 pb-[80px] sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[880px] pt-8 sm:pt-12">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Knowledge Base & Documentation
          </p>

          <h1 className="mt-3 text-[30px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[38px] lg:text-[46px] transition-colors">
            Frequently Asked Questions
          </h1>

          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-[16px] transition-colors">
            Everything you need to know about Calip, Startup Performance Tokens,
            bonding curves, secondary trading, and verified on-chain deal flow.
          </p>

          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search questions or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-[14px] text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/30"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-lg px-4 py-2 text-[12.5px] font-semibold transition-all duration-150 ${
                  activeCategory === tab.id
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
                    : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, catIndex) => (
                <div key={cat.id} className={catIndex > 0 ? "mt-10" : ""}>
                  {showCategoryHeaders && (
                    <div className="mb-4">
                      <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
              <div className="py-16 text-center rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#111318]">
                <p className="text-[15px] text-slate-500 dark:text-slate-400">
                  No results found for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-[13.5px] font-medium text-emerald-600 dark:text-white hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mx-auto mt-16 w-full max-w-[880px]" aria-labelledby="faq-cta-heading">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-[#111318] sm:px-14 sm:py-14 transition-colors">
            <span className="cl-kicker-label">
              <span className="cl-mint-dot" />
              Direct Support
            </span>
            <h2
              id="faq-cta-heading"
              className="mt-3 text-[24px] font-bold text-slate-900 dark:text-white sm:text-[32px] transition-colors"
            >
              Still Have Questions?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
              Need more information about Calip tokenomics, startup onboarding, or private rounds?
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/founders"
                className="cl-btn-primary h-10 px-6 text-[13.5px]"
              >
                Register Your Startup
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-[13.5px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] transition-all"
              >
                <MessageCircle className="h-4 w-4 text-slate-400" />
                Explore Calip
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
