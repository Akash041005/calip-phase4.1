"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Mail,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { getTradersLeaderboard } from "../../lib/tradingApi";

// Top traders list matching Calip & Axiom design
export const TOP_TRADERS = []; // Deprecated: mock catalog removed Sep 2026 — live data via lib/tradingApi.js (GET /tokens, GET /traders/leaderboard).

export default function TopTraderTicker() {
  const router = useRouter();
  const scrollRef = useRef(null);

  // States
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  // Live leaderboard (J6) — replaces the hardcoded TOP_TRADERS tape.
  const [traders, setTraders] = useState([]);
  const [tradersLoading, setTradersLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    getTradersLeaderboard("24H", 10)
      .then((res) => {
        if (!cancelled) {
          setTraders(res.traders || []);
          setTradersLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTradersLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Check scroll position to toggle chevron states
  const checkScrollBounds = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollBounds();
    el.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);
    return () => {
      el.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, [checkScrollBounds]);

  // Smooth mouse-wheel scrolling (horizontal translation)
  const handleWheel = useCallback((e) => {
    if (scrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollRef.current.scrollLeft += e.deltaY * 0.9;
      } else {
        scrollRef.current.scrollLeft += e.deltaX * 0.9;
      }
    }
  }, []);

  // Drag distance guard: distinguishes a scroll-drag from a tap/click so a
  // drag release over a chip doesn't accidentally open the company overview.
  const draggedRef = useRef(0);

  // Navigate straight to the company overview for this trader's best token.
  const openCompanyOverview = useCallback((trader) => {
    if (!trader?.bestTokenId) return;
    router.push(`/insights/${trader.bestTokenId}`);
  }, [router]);

  // Mouse drag-to-scroll handlers
  const handleMouseDown = (e) => {
    draggedRef.current = 0;
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeftPos(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.4;
    draggedRef.current = Math.max(draggedRef.current, Math.abs(walk));
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleChipClick = useCallback((e, trader) => {
    e.stopPropagation();
    // Ignore clicks that end a drag-scroll gesture.
    if (draggedRef.current > 6) {
      draggedRef.current = 0;
      return;
    }
    openCompanyOverview(trader);
  }, [openCompanyOverview]);

  const handleScrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowLeaderboard(false);
        setShowInbox(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative z-[30] w-full border-b border-[#e5e7eb] bg-[#f8fafc] text-[#1e293b] dark:border-b dark:border-[#1a2233] dark:bg-[#070a10] dark:text-[#f8fafc] transition-colors">
      <div className="mx-auto flex h-[36px] max-w-[1440px] items-center px-3 sm:px-4 lg:px-6">
        
        {/* LEFT SECTION: UTILITY CLUSTER & LIVE STATUS */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Live Indicator */}
          <div
            title="Live Calip Trader Stream"
            className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold text-[#6366f1] dark:text-[#818cf8] select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7c6cf0] dark:bg-[#9485f5]"></span>
            </span>
            <span className="hidden text-[10.5px] font-mono uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8] xl:inline-block">
              LIVE
            </span>
          </div>

          {/* Thin Divider */}
          <div className="h-3.5 w-[1px] bg-[#e2e8f0] dark:bg-[#1e2738]" />

          {/* Utility Buttons */}
          <div className="flex items-center gap-1">
            {/* 1. Trophy Button */}
            <button
              type="button"
              onClick={() => setShowLeaderboard((prev) => !prev)}
              title="Top Traders Leaderboard"
              aria-label="Top Traders Leaderboard"
              className={`group flex h-[24px] items-center gap-1 rounded-[6px] px-1.5 text-[11.5px] font-medium transition-all duration-150 ${
                showLeaderboard
                  ? "bg-[#6366f1] text-white dark:bg-[#6366f1]/20 dark:text-[#818cf8] dark:border dark:border-[#6366f1]/50"
                  : "bg-[#eef2ff] text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#e0e7ff] dark:bg-[#131a29] dark:text-[#818cf8] dark:border-[#2a3449] dark:hover:bg-[#1c2438] dark:hover:border-[#6366f1]/40"
              }`}
            >
              <Trophy className="h-3 w-3 text-[#f59e0b]" strokeWidth={2.2} />
              <span className="hidden font-semibold text-[10.5px] sm:inline-block">Top 24H</span>
            </button>

            {/* 2. Inbox */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInbox((prev) => !prev)}
                title="Live Alerts"
                aria-label="Live Alerts"
                className="relative flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#64748b] hover:bg-[#00000008] hover:text-[#1a1a2e] dark:text-[#8892a6] dark:hover:bg-[#161d2b] dark:hover:text-[#c5c7e8] transition-colors"
              >
                <Mail className="h-3 w-3" strokeWidth={1.8} />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#6366f1] dark:bg-[#818cf8]" />
              </button>

              <AnimatePresence>
                {showInbox && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-[28px] z-50 w-[270px] rounded-[10px] border border-[#e2e8f0] bg-white p-3 shadow-xl dark:border-[#222b3d] dark:bg-[#0f1420]"
                  >
                    <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2 dark:border-[#1e2638]">
                      <span className="text-[12px] font-bold text-[#1e293b] dark:text-white flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-[#6366f1] dark:text-[#818cf8]" />
                        Whale Activity Alerts
                      </span>
                      <button
                        onClick={() => setShowInbox(false)}
                        className="text-[#94a3b8] hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="rounded-[6px] bg-[#f8fafc] p-2 text-[11px] dark:bg-[#161d2b]">
                        <p className="font-medium text-[#1e293b] dark:text-slate-200">
                          <span className="font-bold text-[#6366f1] dark:text-[#818cf8]">@SossaDotKek</span> took profit on $GRID (+18.4x)
                        </p>
                        <span className="text-[10px] text-[#64748b]">2m ago</span>
                      </div>
                      <div className="rounded-[6px] bg-[#f8fafc] p-2 text-[11px] dark:bg-[#161d2b]">
                        <p className="font-medium text-[#1e293b] dark:text-slate-200">
                          <span className="font-bold text-[#6366f1] dark:text-[#818cf8]">@CatoshiNaka..</span> bought 42,000 $VEX
                        </p>
                        <span className="text-[10px] text-[#64748b]">7m ago</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. User */}
            <Link
              href="/settings"
              title="Profile & Settings"
              aria-label="Profile & Settings"
              className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#64748b] hover:bg-[#00000008] hover:text-[#1a1a2e] dark:text-[#8892a6] dark:hover:bg-[#161d2b] dark:hover:text-[#c5c7e8] transition-colors"
            >
              <User className="h-3 w-3" strokeWidth={1.8} />
            </Link>

            {/* 4. History */}
            <Link
              href="/performance-summary"
              title="Recent Activity"
              aria-label="Recent Activity"
              className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#64748b] hover:bg-[#00000008] hover:text-[#1a1a2e] dark:text-[#8892a6] dark:hover:bg-[#161d2b] dark:hover:text-[#c5c7e8] transition-colors"
            >
              <Clock className="h-3 w-3" strokeWidth={1.8} />
            </Link>
          </div>

          {/* Thin Divider */}
          <div className="h-3.5 w-[1px] bg-[#e2e8f0] dark:bg-[#1e2738]" />
        </div>

        {/* MIDDLE SECTION: USER-SCROLLABLE TRADER TAPE */}
        <div className="relative ml-2 flex flex-1 items-center overflow-hidden">
          
          {/* Left Navigation Chevron */}
          <button
            type="button"
            onClick={() => handleScrollBy(-220)}
            disabled={!canScrollLeft}
            title="Scroll Left"
            className={`z-20 flex h-[22px] w-[20px] items-center justify-center rounded-l-[4px] bg-[#f8fafc]/90 text-[#64748b] hover:text-[#1e293b] dark:bg-[#070a10]/90 dark:text-[#8892a6] dark:hover:text-white transition-opacity ${
              canScrollLeft ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Left Fade Gradient Mask */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-5 top-0 bottom-0 z-10 w-4 bg-gradient-to-r from-[#f8fafc] to-transparent dark:from-[#070a10]" />
          )}

          {/* USER-CONTROLLED SCROLLABLE CONTAINER */}
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="flex w-full items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 select-none cursor-grab active:cursor-grabbing"
            title="Scroll horizontally using mouse wheel, trackpad, or click-and-drag"
          >
            {tradersLoading ? (
              <span className="px-2 py-0.5 text-[11.5px] text-[#64748b]">Loading…</span>
            ) : traders.length === 0 ? (
              <span className="px-2 py-0.5 text-[11.5px] text-[#64748b]">No traders yet</span>
            ) : traders.map((trader) => (
              <div
                key={trader.id}
                role="link"
                tabIndex={0}
                title={`Open ${trader.bestToken} company overview`}
                onClick={(e) => handleChipClick(e, trader)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCompanyOverview(trader);
                  }
                }}
                className="group inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 transition-colors duration-150 hover:bg-[#0000000a] dark:hover:bg-[#141b29] cursor-pointer shrink-0"
              >
                {/* Circular Avatar */}
                <div
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-br text-[10px] border ${trader.avatarRing} ${trader.avatarBg} shrink-0`}
                >
                  <span>{trader.avatarIcon}</span>
                </div>

                {/* Trader Handle */}
                <span className="text-[11.5px] font-medium text-[#334155] dark:text-[#cbd5e1] group-hover:text-[#6366f1] dark:group-hover:text-[#818cf8] transition-colors">
                  {trader.handle}
                </span>

                {/* Profit Badge (Calip signature rgb(124,108,240)) */}
                <span className="font-mono text-[11.5px] font-bold text-[#7c6cf0] dark:text-[#9485f5]">
                  {trader.pnl}
                </span>
              </div>
            ))}
          </div>

          {/* Right Fade Gradient Mask */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-5 top-0 bottom-0 z-10 w-4 bg-gradient-to-l from-[#f8fafc] to-transparent dark:from-[#070a10]" />
          )}

          {/* Right Navigation Chevron */}
          <button
            type="button"
            onClick={() => handleScrollBy(220)}
            disabled={!canScrollRight}
            title="Scroll Right"
            className={`z-20 flex h-[22px] w-[20px] items-center justify-center rounded-r-[4px] bg-[#f8fafc]/90 text-[#64748b] hover:text-[#1e293b] dark:bg-[#070a10]/90 dark:text-[#8892a6] dark:hover:text-white transition-opacity ${
              canScrollRight ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* TOP TRADERS LEADERBOARD MODAL */}
      <AnimatePresence>
        {showLeaderboard && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowLeaderboard(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white p-5 shadow-2xl dark:border-[#222b3d] dark:bg-[#0d121c] text-[#1e293b] dark:text-[#f8fafc]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 dark:border-[#1e2738]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-amber-500/15 text-amber-500">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0f172a] dark:text-white">
                      Top Traders Leaderboard
                    </h3>
                    <p className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8]">
                      Highest 24H on-chain realized PnL on Calip
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLeaderboard(false)}
                  className="rounded-full p-1 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a] dark:hover:bg-[#1a2233] dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Table */}
              <div className="mt-3 max-h-[380px] overflow-y-auto pr-1">
                <div className="grid grid-cols-[36px_1fr_90px_80px] text-[11px] uppercase tracking-wider text-[#64748b] dark:text-[#64748b] pb-2 font-semibold border-b border-[#f1f5f9] dark:border-[#182030]">
                  <span>Rank</span>
                  <span>Trader</span>
                  <span className="text-right">Win Rate</span>
                  <span className="text-right">24H PnL</span>
                </div>

                <div className="divide-y divide-[#f1f5f9] dark:divide-[#141b29]">
            {tradersLoading ? (
              <span className="px-2 py-0.5 text-[11.5px] text-[#64748b]">Loading traders…</span>
            ) : traders.length === 0 ? (
              <span className="px-2 py-0.5 text-[11.5px] text-[#64748b]">No traders yet</span>
            ) : (
            traders.map((trader) => (
                    <div
                      key={trader.id}
                      role="link"
                      tabIndex={0}
                      title={`Open ${trader.bestToken} company overview`}
                      onClick={() => {
                        setShowLeaderboard(false);
                        openCompanyOverview(trader);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setShowLeaderboard(false);
                          openCompanyOverview(trader);
                        }
                      }}
                      className="grid grid-cols-[36px_1fr_90px_80px] items-center py-2.5 text-[12.5px] hover:bg-[#f8fafc] dark:hover:bg-[#131926] px-1 rounded-[8px] cursor-pointer transition-colors"
                    >
                      <span className="font-mono font-bold text-[12px]">
                        {trader.rank === 1 ? (
                          <span className="text-amber-500">🥇</span>
                        ) : trader.rank === 2 ? (
                          <span className="text-slate-400">🥈</span>
                        ) : trader.rank === 3 ? (
                          <span className="text-amber-700">🥉</span>
                        ) : (
                          <span className="text-[#64748b]">#{trader.rank}</span>
                        )}
                      </span>

                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-[22px] w-[22px] items-center justify-center rounded-full bg-gradient-to-br text-[11px] border ${trader.avatarRing} ${trader.avatarBg} shrink-0`}
                        >
                          <span>{trader.avatarIcon}</span>
                        </div>
                        <span className="font-semibold text-[#1e293b] dark:text-[#e2e8f0]">
                          {trader.handle}
                        </span>
                      </div>

                      <span className="text-right font-mono font-medium text-[#6366f1] dark:text-[#818cf8]">
                        {trader.winRate}%
                      </span>

                      <span className="text-right font-mono font-bold text-[#7c6cf0] dark:text-[#9485f5]">
                        {trader.pnl}
                      </span>
                    </div>
                  )))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#e2e8f0] pt-2 text-[11px] text-[#64748b] dark:border-[#1e2738]">
                <span>Updated in real time via Calip Smart Indexer</span>
                <span className="font-semibold text-[#6366f1] dark:text-[#818cf8]">{traders.length} active whales</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
