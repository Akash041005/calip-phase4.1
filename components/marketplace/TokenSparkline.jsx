"use client";

// Minimal SVG sparkline with a one-time draw reveal (V1).
// Pure SVG/SMIL — no chart lib, no constant animation.
export default function TokenSparkline({ points = [], width = 120, height = 36, positive = true, label }) {
  if (!points.length) return null;
  const last = points[points.length - 1];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * (width - 8) + 4;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = positive ? "#10b981" : "#f43f5e";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" role="img" aria-label={label || "Trend sparkline"}>
      <title>{label || `Latest value ${last}`}</title>
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
      >
        <animate attributeName="stroke-dashoffset" from="1" to="0" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1" />
      </polyline>
    </svg>
  );
}
