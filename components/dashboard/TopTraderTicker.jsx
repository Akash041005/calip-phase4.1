"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTradersLeaderboard } from "../../lib/tradingApi";

export default function TopTraderTicker() {
  const scrollRef = useRef(null);

  // States
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Live trader feed
  const [traders, setTraders] = useState([]);
  const [tradersLoading, setTradersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTradersLeaderboard("24H", 12)
      .then((res) => {
        if (!cancelled) {
          setTraders(res.traders || []);
          setTradersLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTradersLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  const draggedRef = useRef(0);

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

  const handleScrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative z-[30] w-full border-b border-white/[0.08] bg-[#0b0d12] text-[#f8fafc] transition-colors">
      <div className="mx-auto flex h-[34px] max-w-[1440px] items-center px-3 sm:px-4 lg:px-6">
        {/* LEFT SECTION: CLEAN LIVE STATUS INDICATOR */}
        <div className="flex shrink-0 items-center gap-2">
          <div
            title="Live On-Chain Calip Trader Stream"
            className="flex items-center gap-1.5 rounded bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[10.5px] font-mono text-zinc-400 select-none"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">
              LIVE STREAM
            </span>
          </div>

          {/* Thin Divider */}
          <div className="h-3.5 w-px bg-white/[0.08]" />
        </div>

        {/* MIDDLE SECTION: CLEAN SCROLLABLE TRADER TAPE */}
        <div className="relative ml-2 flex flex-1 items-center overflow-hidden">
          {/* Left Navigation Chevron */}
          <button
            type="button"
            onClick={() => handleScrollBy(-220)}
            disabled={!canScrollLeft}
            title="Scroll Left"
            className={`z-20 flex h-[22px] w-[20px] items-center justify-center rounded bg-[#0b0d12] text-[#8892a6] hover:text-white transition-opacity ${
              canScrollLeft ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Left Fade Gradient Mask */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-5 top-0 bottom-0 z-10 w-4 bg-gradient-to-r from-[#0b0d12] to-transparent" />
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
            title="Scroll horizontally using mouse wheel, trackpad, or drag"
          >
            {tradersLoading ? (
              <span className="px-2 py-0.5 text-[11px] text-slate-400">Loading live stream…</span>
            ) : traders.length === 0 ? (
              <span className="px-2 py-0.5 text-[11px] text-slate-400">No active trades</span>
            ) : (
              traders.map((trader, idx) => (
                <div
                  key={trader.id || trader.handle || idx}
                  className="group inline-flex items-center gap-1.5 rounded px-2 py-0.5 transition-colors duration-150 hover:bg-white/[0.04] shrink-0"
                >
                  {/* Subtle Monochrome Avatar */}
                  <div
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-zinc-800 text-[9px] font-mono text-zinc-300 border border-white/10 shrink-0"
                  >
                    <span>{trader.avatarIcon ? trader.avatarIcon.replace(/[⚡🚀🔥💎]/g, "•") : "•"}</span>
                  </div>

                  {/* Trader Handle */}
                  <span className="text-[11.5px] font-medium text-zinc-300">
                    {trader.handle}
                  </span>

                  {/* Profit Badge */}
                  <span className="font-mono text-[11px] font-medium text-emerald-400">
                    {trader.profit || trader.pnl}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Right Fade Gradient Mask */}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-5 top-0 bottom-0 z-10 w-4 bg-gradient-to-l from-[#0b0d12] to-transparent" />
          )}

          {/* Right Navigation Chevron */}
          <button
            type="button"
            onClick={() => handleScrollBy(220)}
            disabled={!canScrollRight}
            title="Scroll Right"
            className={`z-20 flex h-[22px] w-[20px] items-center justify-center rounded-r-[4px] bg-[#0b0d12] text-[#8892a6] hover:text-white transition-opacity ${
              canScrollRight ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
