"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { getTokenHistory, getTokenOHLC } from "../../lib/tradingApi";

const RANGES = [
  { id: "24H", points: 24, label: "24H" },
  { id: "7D", points: 28, label: "7D" },
  { id: "30D", points: 30, label: "30D" },
];

const ZOOM_LEVELS = [1, 2, 4];

export default function TokenPerformanceChart({ token }) {
  const [range, setRange] = useState("7D");
  const [chartType, setChartType] = useState("line"); // "line" | "candles"
  const [zoomIdx, setZoomIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(null);
  const chartBoxRef = useRef(null);
  const pinchDist = useRef(null);

  function stepZoom(dir) {
    setZoomIdx((i) => Math.max(0, Math.min(ZOOM_LEVELS.length - 1, i + dir)));
  }

  // Trackpad pinch (ctrl+wheel) zooms the graph instead of the page.
  useEffect(() => {
    const el = chartBoxRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      e.stopPropagation();
      stepZoom(e.deltaY > 0 ? -1 : 1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      pinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length !== 2 || pinchDist.current === null) return;
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const ratio = d / pinchDist.current;
    if (ratio > 1.18) {
      stepZoom(1);
      pinchDist.current = d;
    } else if (ratio < 0.85) {
      stepZoom(-1);
      pinchDist.current = d;
    }
  }

  function handleTouchEnd() {
    pinchDist.current = null;
  }
  const positive = (token.change24h ?? 0) >= 0;
  const color = positive ? "#10b981" : "#f43f5e";

  // Live backend series: J2 history (line) + J3 OHLC (candles).
  const [remotePoints, setRemotePoints] = useState(null);
  const [remoteCandles, setRemoteCandles] = useState(null);
  const [chartError, setChartError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const id = token.id || token.startupId;
    if (!id) return;
    Promise.all([
      getTokenHistory(id, range).catch(() => ({ points: [] })),
      getTokenOHLC(id, "1h", 30).catch(() => ({ candles: [] })),
    ]).then(([h, o]) => {
      if (cancelled) return;
      if ((!h.points || h.points.length === 0) && (!o.candles || o.candles.length === 0)) {
        setChartError("No chart data yet for this token.");
      } else {
        setChartError("");
      }
      setRemotePoints(h.points || []);
      setRemoteCandles(o.candles || []);
    });
    return () => { cancelled = true; };
  }, [token.id, token.startupId, range]);

  const fullPoints = useMemo(() => {
    if (remotePoints && remotePoints.length > 0) return remotePoints.map((p) => Number(p.c));
    return [];
  }, [remotePoints]);

  const fullCandles = useMemo(() => {
    if (remoteCandles && remoteCandles.length > 0) return remoteCandles;
    if (remotePoints && remotePoints.length > 0) return remotePoints.map((p) => ({ o: p.o, h: p.h, l: p.l, c: p.c }));
    return [];
  }, [remoteCandles, remotePoints]);

  // Zoom shows the most recent slice of the series.
  const visibleCount = Math.max(
    6,
    Math.ceil(fullPoints.length / ZOOM_LEVELS[zoomIdx])
  );
  const points = fullPoints.slice(-visibleCount);
  const candles = fullCandles.slice(-visibleCount);

  if (remotePoints === null || remoteCandles === null) {
    return (
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[30px] font-extrabold text-white">
            ${Number(token.price || 0).toFixed(2)}
          </span>
        </div>
        <div className="mt-3 rounded-xl border border-white/5 bg-[#0b0e14] p-8 text-center text-[13px] text-[#94a3b8]">
          Loading chart…
        </div>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[30px] font-extrabold text-white">
            ${Number(token.price || 0).toFixed(2)}
          </span>
          <span className={`font-mono text-[14px] font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
            {positive ? "+" : ""}{Number(token.change24h || 0).toFixed(2)}%
          </span>
        </div>
        <div className="mt-3 rounded-xl border border-white/5 bg-[#0b0e14] p-8 text-center text-[13px] text-[#94a3b8]">
          {chartError || "No chart data yet for this token."}
        </div>
      </div>
    );
  }

  const W = 640;
  const H = 220;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * (W - 16) + 8;
    const y = H - 24 - ((v - min) / (max - min || 1)) * (H - 56);
    return [x, y];
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `8,${H - 16} ${line} ${(W - 8).toFixed(1)},${H - 16}`;
  const last = coords[coords.length - 1];
  const gid = `perf-${token.id}-${range}`;

  // Live OHLC values are real prices — use directly (no walk rescaling).
  const pricedCandles = candles.map((c) => ({
    o: Number(c.o),
    h: Number(c.h),
    l: Number(c.l),
    c: Number(c.c),
  }));
  const pMin = Math.min(...pricedCandles.map((c) => c.l));
  const pMax = Math.max(...pricedCandles.map((c) => c.h));
  const pSpan = pMax - pMin || 1;
  const candleSlot = (W - 16) / pricedCandles.length;
  const candleWidth = Math.max(3, Math.min(14, candleSlot * 0.55));
  const py = (p) => H - 24 - ((p - pMin) / pSpan) * (H - 56);
  const px = (i) => (i / Math.max(pricedCandles.length - 1, 1)) * (W - 16) + 8;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[30px] font-extrabold text-white">
            ${token.price.toFixed(2)}
          </span>
          <span className={`font-mono text-[14px] font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
            {positive ? "+" : ""}{token.change24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1" role="group" aria-label="Chart type">
            {[
              { id: "line", label: "Line" },
              { id: "candles", label: "Candles" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setChartType(t.id)}
                className={`rounded-md px-3 py-1 text-[12px] font-semibold transition ${
                  chartType === t.id ? "bg-[#6366f1] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1" role="group" aria-label="Zoom">
            <button
              type="button"
              onClick={() => setZoomIdx((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1))}
              disabled={zoomIdx >= ZOOM_LEVELS.length - 1}
              aria-label="Zoom in"
              className="rounded-md p-1.5 text-neutral-400 transition hover:text-white disabled:opacity-30"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="min-w-[32px] text-center font-mono text-[11px] font-bold text-neutral-300">
              {ZOOM_LEVELS[zoomIdx]}x
            </span>
            <button
              type="button"
              onClick={() => setZoomIdx((i) => Math.max(i - 1, 0))}
              disabled={zoomIdx <= 0}
              aria-label="Zoom out"
              className="rounded-md p-1.5 text-neutral-400 transition hover:text-white disabled:opacity-30"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRange(r.id);
                  setZoomIdx(0);
                }}
                className={`rounded-md px-3 py-1 text-[12px] font-semibold transition ${
                  range === r.id ? "bg-[#6366f1] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={chartBoxRef}
        data-lenis-prevent
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="mt-3 overflow-hidden rounded-xl border border-white/5 bg-[#0b0e14] p-3"
      >
        <div
          className="relative cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const len = chartType === "candles" ? pricedCandles.length : coords.length;
            setHoverIdx(Math.round(frac * (len - 1)));
          }}
          onMouseLeave={() => setHoverIdx(null)}
        >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[220px] w-full" role="img" aria-label={`${token.name} performance chart`}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="8" x2={W - 8} y1={H * f} y2={H * f} stroke="#1a2436" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          {chartType === "line" ? (
            <>
              <polygon points={area} fill={`url(#${gid})`} />
              <polyline
                points={line}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
              >
                <animate attributeName="stroke-dashoffset" from="1" to="0" dur="0.9s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1" />
              </polyline>
              <circle cx={last[0]} cy={last[1]} r="5" fill={color} opacity="0.25" />
              <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
            </>
          ) : (
            <g>
              {pricedCandles.map((c, i) => {
                const up = c.c >= c.o;
                const fill = up ? "#10b981" : "#f43f5e";
                const x = px(i);
                const top = py(Math.max(c.o, c.c));
                const bottom = py(Math.min(c.o, c.c));
                return (
                  <g key={i}>
                    <line x1={x} x2={x} y1={py(c.h)} y2={py(c.l)} stroke={fill} strokeWidth={1.5} />
                    <rect
                      x={x - candleWidth / 2}
                      y={top}
                      width={candleWidth}
                      height={Math.max(2, bottom - top)}
                      rx={1}
                      fill={fill}
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
        {hoverIdx !== null && (() => {
          const isCandle = chartType === "candles";
          const len = isCandle ? pricedCandles.length : coords.length;
          const idx = Math.max(0, Math.min(len - 1, hoverIdx));
          const frac = len > 1 ? idx / (len - 1) : 0;
          const hx = isCandle ? px(idx) : coords[idx][0];
          const hy = isCandle ? py(pricedCandles[idx].c) : coords[idx][1];
          const xPct = (hx / W) * 100;
          const yPct = (hy / H) * 100;
          const rows = isCandle
            ? [
                ["O", pricedCandles[idx].o],
                ["H", pricedCandles[idx].h],
                ["L", pricedCandles[idx].l],
                ["C", pricedCandles[idx].c],
              ]
            : [["Price", points[idx]]];
          const align = frac < 0.25 ? "" : frac > 0.75 ? "-translate-x-full" : "-translate-x-1/2";
          const below = yPct < 32;
          return (
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-white/25"
                style={{ left: `${xPct}%` }}
              />
              <div
                className="absolute h-2.5 w-2.5 rounded-full border-2 border-[#0b0e14]"
                style={{ left: `calc(${xPct}% - 5px)`, top: `calc(${yPct}% - 5px)`, background: color }}
              />
              <div
                className={`absolute ${align} rounded-lg border border-white/10 bg-[#111827]/95 px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap shadow-xl`}
                style={
                  below
                    ? { left: `${xPct}%`, top: `calc(${yPct}% + 12px)` }
                    : { left: `${xPct}%`, bottom: `${100 - yPct}%`, marginBottom: "12px" }
                }
              >
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[#5e6f85]">{label}</span>
                    <span className="font-bold text-white">${value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        </div>
        <div className="flex justify-between px-1 font-mono text-[11px] text-[#5e6f85]">
          <span>Low ${(chartType === "candles" ? pMin : min).toFixed(2)}</span>
          <span>High ${(chartType === "candles" ? pMax : max).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
