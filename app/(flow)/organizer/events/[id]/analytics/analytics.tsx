"use client";

import { useMemo, useState, type ReactNode } from "react";
import { money } from "@/lib/data";
import { useNest } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/shell/flow-layout";
import { Modal } from "@/components/ui/primitives";
import { IconCalendar, IconCheckCircle, IconClock } from "@/components/ui/icons";
import { CHART_COLORS, DonutChart, LineChart, type DonutSlice } from "@/app/(app)/dashboard/_components/charts";
import { IconWallet } from "@/app/(app)/dashboard/_components/dashboard-icons";
import { conversionRate, eventStats, hash } from "@/app/(app)/dashboard/_components/org-stats";

/** Monthly shape of the sales curve (share of the year's total per month). */
const SALES_SHAPE = [0.076, 0.116, 0.097, 0.062, 0.093, 0.057, 0.069, 0.102, 0.083, 0.052, 0.097, 0.096];
const SALES_LABELS = ["Jan", "Mar", "May", "Jul"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July"];

const RANGES = [
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "90", label: "Last 90 days", days: 90 },
];

const SLICE_COLORS = [CHART_COLORS.accentLight, CHART_COLORS.blue, CHART_COLORS.lime, "#b9b9b9"];

const num = (n: number) => n.toLocaleString("en-US");

/** "May 01 - May 30" */
function monthRange(start: Date, end: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${MONTHS[start.getMonth()]} ${pad(start.getDate())} - ${MONTHS[end.getMonth()]} ${pad(end.getDate())}`;
}

function KpiTile({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-[24px] border border-white/5 bg-[#121212] p-3 sm:p-4 lg:h-[140px]">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1f1f1f] text-accent">{icon}</span>
      <span className="mt-3 truncate text-[18px] font-bold text-text sm:mt-4 sm:text-[26px]">{value}</span>
      <span className="mt-0.5 truncate text-[11px] text-text/90 sm:text-[15px]">{label}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <span className="min-w-0 flex-1 text-[14px] text-dim sm:text-[16px]">{label}</span>
      <span className="shrink-0 text-[14px] text-text sm:text-[16px]">{value}</span>
    </div>
  );
}

/** Full analytics for one event: KPIs, sales line chart, ticket-type donut and summary. */
export function EventAnalytics({ id }: { id: string }) {
  const hydrated = useNest((s) => s.hydrated);
  const event = useNest((s) => s.events.find((e) => e.id === id));
  const orders = useNest((s) => s.orders);
  const [rangeKey, setRangeKey] = useState("30");
  const [rangeOpen, setRangeOpen] = useState(false);

  const stats = useMemo(() => (event ? eventStats(event, orders) : null), [event, orders]);

  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[0];
  const rangeLabel = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - range.days);
    return monthRange(start, end);
  }, [range.days]);

  const backHref = `/organizer/events/${id}`;

  if (!hydrated) {
    return (
      <FlowPage title="Back" backHref={backHref} width="xl">
        <p className="text-dim">Loading…</p>
      </FlowPage>
    );
  }
  if (!event || !stats) {
    return (
      <FlowPage title="Back" backHref="/organizer/events" width="xl">
        <div className="flex flex-col items-start gap-4">
          <p className="text-lg text-text">This event no longer exists.</p>
          <Button variant="white" href="/organizer/events">
            Back to My Events
          </Button>
        </div>
      </FlowPage>
    );
  }

  const conversion = conversionRate(stats.sold, stats.visits);

  // Sales curve Jan–Jul (revenue share per month); the weakest month is called out ("4,890: Low sales in June").
  // Unrounded so small totals (e.g. a single order) still draw the curve instead of a flat zero line.
  const series = SALES_SHAPE.slice(0, 7).map((share) => stats.revenue * share);
  const lowIndex = series.reduce((best, v, i) => (v < series[best] ? i : best), 0);
  const lowValue = num(Math.round(series[lowIndex]));
  const growth = 10 + (hash(id) % 35);

  // Top 3 ticket types by revenue (by tickets for free events), the rest grouped as "Other".
  const byRevenue = stats.revenue > 0;
  const top = stats.byType.slice(0, 3);
  const rest = stats.byType.slice(3);
  const slices: DonutSlice[] = [
    ...top.map((t, i) => ({
      label: t.name,
      value: byRevenue ? t.revenue : t.sold,
      color: SLICE_COLORS[i],
      amountLabel: byRevenue ? money(t.revenue) : `${num(t.sold)} tickets`,
    })),
    ...(rest.length
      ? [
          {
            label: "Other",
            value: rest.reduce((a, t) => a + (byRevenue ? t.revenue : t.sold), 0),
            color: SLICE_COLORS[3],
            amountLabel: byRevenue ? money(rest.reduce((a, t) => a + t.revenue, 0)) : `${num(rest.reduce((a, t) => a + t.sold, 0))} tickets`,
          },
        ]
      : []),
  ];

  return (
    <FlowPage title="View Analytics" backHref={backHref} width="full" stacked>
      <div className="flex flex-col gap-7">
        {/* Figma row 1: KPI tiles + date range */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-9">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-5 lg:grid-cols-[repeat(3,156px)]">
            <KpiTile icon={<IconWallet size={20} />} value={money(stats.revenue).replace(/\.00$/, "")} label="Revenue" />
            <KpiTile icon={<IconClock size={20} />} value={num(stats.sold)} label="Tickets" />
            <KpiTile icon={<IconCalendar size={20} />} value={num(stats.visits)} label="Page Visits" />
          </div>
          <button
            type="button"
            onClick={() => setRangeOpen(true)}
            className="flex h-14 w-full items-center justify-between gap-3 rounded-full bg-surface px-6 text-left text-[15px] text-text transition hover:bg-surface-3 lg:h-[66px] lg:w-[458px] lg:text-[17px]"
            aria-label={`Date range: ${range.label}`}
          >
            <span className="truncate">{rangeLabel}</span>
            <IconCalendar size={22} className="shrink-0" />
          </button>
        </div>

        {/* Figma row 2: Sales Performance · Top Tickets Types · Summary */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          <section className="flex min-w-0 flex-col rounded-[28px] border border-white/5 bg-[#121212] p-5 sm:p-7">
            <h2 className="text-[22px] font-semibold text-text sm:text-[26px]">Sales Performance</h2>
            <p className="mb-8 text-[15px] text-dim sm:text-[19px]">{rangeLabel}</p>
            <LineChart values={series} labels={SALES_LABELS} highlightIndex={lowIndex} highlightLabel={`${lowValue}: Low sales in ${MONTH_NAMES[lowIndex]}`} />
            <div className="mt-10 flex items-center gap-4">
              <span className="text-[34px] font-medium text-text sm:text-[40px]">{growth}%</span>
              <span className="text-[14px] leading-snug text-dim sm:text-[17px]">
                Your sales performance is {growth}% better compare to last month
              </span>
            </div>
          </section>

          <section className="flex min-w-0 flex-col rounded-[28px] border border-white/5 bg-[#121212] p-5 sm:p-7">
            <h2 className="text-[22px] font-semibold text-text sm:text-[26px]">Top Tickets Types</h2>
            <p className="mb-4 text-[15px] text-dim sm:text-[19px]">{rangeLabel}</p>
            {slices.length ? <DonutChart slices={slices} stacked /> : <p className="text-sm text-dim">This event has no ticket types yet.</p>}
          </section>

          <section className="min-w-0 rounded-[28px] border border-white/5 bg-[#121212] p-5 sm:p-7 md:col-span-2 xl:col-span-1">
            <h2 className="mb-4 text-[22px] font-semibold text-text sm:text-[26px]">Summary</h2>
            <SummaryRow label="Total Revenue" value={money(stats.revenue)} />
            <SummaryRow label="Total Tickets Sold" value={num(stats.sold)} />
            <SummaryRow label="Total Page Visits" value={num(stats.visits)} />
            <SummaryRow label="Conversions Rate ( Tickets sold/ Visits )" value={conversion} />
          </section>
        </div>
      </div>

      <Modal open={rangeOpen} onClose={() => setRangeOpen(false)} title="Date range">
        <div className="flex flex-col gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setRangeKey(r.key);
                setRangeOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 rounded-[16px] border-[1.5px] bg-surface px-4 py-4 text-left transition hover:bg-surface-3",
                r.key === rangeKey ? "border-accent" : "border-transparent",
              )}
            >
              <span className="flex-1 font-medium text-text">{r.label}</span>
              {r.key === rangeKey && <IconCheckCircle size={20} className="text-accent" />}
            </button>
          ))}
        </div>
        <Button variant="white" block className="mt-4" onClick={() => setRangeOpen(false)}>
          Done
        </Button>
      </Modal>
    </FlowPage>
  );
}
