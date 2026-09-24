"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/* Small inline-SVG charts ported from the mobile app (components/charts). They all
   scale with their container through viewBox + w-full, so no measuring is needed. */

export const CHART_COLORS = {
  accent: "#ff6a00",
  accentLight: "#ffa06b",
  blue: "#4264ef",
  lime: "#c5f25a",
  track: "#2b2b2b",
};

type BarDatum = { label: string; value: number; tooltip?: string };

/** Rounded vertical bar chart (Analytics weekly chart). Click a bar to highlight it. */
export function BarChart({ data, className }: { data: BarDatum[]; className?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const defaultActive = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const [active, setActive] = useState(defaultActive);

  const W = 700;
  const H = 220;
  const top = 44;
  const gap = 18;
  const barW = (W - gap * (data.length - 1)) / data.length;
  const innerH = H - top;

  return (
    <div className={cn("rounded-[24px] bg-surface p-4 sm:p-5", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Weekly activity">
        {data.map((d, i) => {
          const h = Math.max(28, (d.value / max) * innerH);
          const x = i * (barW + gap);
          const y = H - h;
          const isActive = i === active;
          return (
            <g key={d.label} onClick={() => setActive(i)} className="cursor-pointer">
              <rect x={x} y={top} width={barW} height={innerH} fill="transparent" />
              <rect x={x} y={y} width={barW} height={h} rx={Math.min(barW / 2, 40)} fill={isActive ? "#fcfcfc" : CHART_COLORS.track} />
              {isActive && d.tooltip && (
                <g>
                  <rect x={x + barW / 2 - 30} y={y - 42} width={60} height={30} rx={15} fill="#fcfcfc" />
                  <path d={`M ${x + barW / 2 - 6} ${y - 13} L ${x + barW / 2} ${y - 6} L ${x + barW / 2 + 6} ${y - 13} Z`} fill="#fcfcfc" />
                  <text x={x + barW / 2} y={y - 22} textAnchor="middle" fontSize={15} fontWeight={600} fill="#0d0d0d">
                    {d.tooltip}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((d, i) => (
          <button
            key={d.label}
            type="button"
            onClick={() => setActive(i)}
            className={cn("text-center text-xs sm:text-sm", i === active ? "font-medium text-text" : "text-dim")}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Smooth orange line over gradient columns (Event Analytics "Sales Performance"). */
export function LineChart({
  values,
  labels,
  highlightIndex,
  highlightLabel,
  color = CHART_COLORS.accent,
}: {
  values: number[];
  labels: string[];
  highlightIndex?: number;
  /** "value: description" — the part before the colon renders in the accent colour. */
  highlightLabel?: string;
  color?: string;
}) {
  const gradId = useId().replace(/:/g, "");
  const W = 600;
  const H = 330;
  const padX = 14;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;
  const points = values.map((v, i) => ({
    x: padX + i * step,
    y: padY + innerH - ((v - min) / (max - min || 1)) * innerH,
  }));
  const colCount = 7;
  const colW = innerW / colCount;
  const hi = highlightIndex ?? values.indexOf(max);
  const p = points[hi];
  const [lead, ...rest] = (highlightLabel ?? "").split(":");
  // Figma: the column behind the highlighted point is solid dark
  const hiCol = p ? Math.min(colCount - 1, Math.max(0, Math.floor((p.x - padX) / colW))) : -1;

  return (
    <div className="w-full">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sales performance">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1a1a1a" />
              <stop offset="1" stopColor="#b3b3bc" />
            </linearGradient>
          </defs>
          {Array.from({ length: colCount }).map((_, i) => (
            <rect key={i} x={padX + i * colW + 3} y={padY} width={colW - 6} height={innerH} fill={i === hiCol ? "#1b1b1b" : `url(#${gradId})`} />
          ))}
          <path d={smoothPath(points)} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {p && <circle cx={p.x} cy={p.y} r={7} fill="#0d0d0d" stroke={color} strokeWidth={3.5} />}
        </svg>
        {highlightLabel && p && (
          <div
            className="pointer-events-none absolute max-w-[70%] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[8px] border border-white/10 bg-[#0d0d0d] px-3 py-1.5 text-[11px] text-text shadow-lg sm:text-[13px]"
            style={{
              left: `${Math.min(Math.max((p.x / W) * 100, 22), 78)}%`,
              top: `calc(${(p.y / H) * 100}% - 40px)`,
            }}
          >
            <span className="text-accent">{lead}:</span> {rest.join(":").trim()}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between px-3">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`} className={cn("text-[13px] sm:text-[15px]", i === labels.length - 1 ? "text-accent" : "text-dim")}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export type DonutSlice = { label: string; value: number; color: string; amountLabel?: string };

function polar(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const so = polar(cx, cy, rOuter, start);
  const eo = polar(cx, cy, rOuter, end);
  const si = polar(cx, cy, rInner, end);
  const ei = polar(cx, cy, rInner, start);
  return `M ${so.x} ${so.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${eo.x} ${eo.y} L ${si.x} ${si.y} A ${rInner} ${rInner} 0 ${large} 0 ${ei.x} ${ei.y} Z`;
}

/** Donut with round percentage badges + legend (Event Analytics "Top Tickets Types"). `stacked` puts the legend below (Figma). */
export function DonutChart({ slices, stacked }: { slices: DonutSlice[]; stacked?: boolean }) {
  const size = 300;
  const thickness = 62;
  const total = slices.reduce((n, s) => n + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 32;
  const rInner = rOuter - thickness;
  const visible = slices.filter((s) => s.value > 0);
  const arcs = visible.map((s, i) => {
    const start = (visible.slice(0, i).reduce((n, x) => n + x.value, 0) / (total || 1)) * 360;
    const end = start + (s.value / (total || 1)) * 360;
    const mid = polar(cx, cy, rOuter - 6, (start + end) / 2);
    return { ...s, start, end, mid, pct: Math.round((s.value / (total || 1)) * 100) };
  });

  return (
    // Layout follows the card's width (container query), not the viewport — the card can be narrow on tablets.
    <div className="@container w-full min-w-0">
      <div className={cn("flex flex-col items-center gap-6", !stacked && "@min-[420px]:flex-row @min-[420px]:gap-8")}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[300px] shrink-0" role="img" aria-label="Ticket type split">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={rOuter - thickness / 2} fill="none" stroke={CHART_COLORS.track} strokeWidth={thickness} />
          ) : arcs.length === 1 ? (
            <circle cx={cx} cy={cy} r={rOuter - thickness / 2} fill="none" stroke={arcs[0].color} strokeWidth={thickness} />
          ) : (
            arcs.map((a) => <path key={a.label} d={arcPath(cx, cy, rOuter, rInner, a.start, a.end)} fill={a.color} />)
          )}
          {arcs.map((a) => (
            <g key={`b-${a.label}`}>
              <circle cx={a.mid.x} cy={a.mid.y} r={27} fill="#1d1d1d" stroke="#0d0d0d" strokeWidth={5} />
              <text x={a.mid.x} y={a.mid.y + 6} textAnchor="middle" fontSize={17} fontWeight={600} fill="#fcfcfc">
                {a.pct}%
              </text>
            </g>
          ))}
        </svg>
        <ul className={cn("flex w-full min-w-0 flex-col", stacked ? "mt-2 gap-7" : "gap-3")}>
          {slices.map((s) => (
            <li key={s.label} className={cn("flex items-center gap-3", stacked ? "text-[16px] sm:text-[18px]" : "text-sm")}>
              <span className={cn("shrink-0 rounded-full", stacked ? "h-4 w-4" : "h-2.5 w-2.5")} style={{ backgroundColor: s.color }} />
              <span className="min-w-0 flex-1 truncate text-muted">{s.label}</span>
              {s.amountLabel && <span className="font-medium text-text">{s.amountLabel}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
