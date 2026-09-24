"use client";

import type { ReactNode, SVGProps } from "react";
import { useNest } from "@/lib/store";
import type { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { stamp } from "./event-ops";

/* ---------- icons used only by the event-ops screens ---------- */

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconScan = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16" />
  </svg>
);
export const IconReceipt = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h3" />
  </svg>
);
export const IconCash = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 9.5v.01M18 14.5v.01" />
  </svg>
);
export const IconGift = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9ZM3 7h18v4H3zM12 7v14M12 7S10.5 3 8 3a2 2 0 0 0 0 4h4Zm0 0s1.5-4 4-4a2 2 0 0 1 0 4h-4Z" />
  </svg>
);
export const IconCamera = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
);
export const IconKeypad = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2.6}>
    <path d="M6 5h.01M12 5h.01M18 5h.01M6 11h.01M12 11h.01M18 11h.01M6 17h.01M12 17h.01M18 17h.01" />
  </svg>
);

/* ---------- shared building blocks ---------- */

type Tone = "success" | "danger" | "neutral" | "primary";

const TONES: Record<Tone, string> = {
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-surface-3 text-muted",
  primary: "bg-accent/15 text-accent",
};

/** Small status chip: "Scanned" (green), "Refunded", "Declined" (red), "Pending" (orange). */
export function StatusPill({ label, tone = "neutral", icon }: { label: string; tone?: Tone; icon?: "check" | "close" }) {
  return (
    <span className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium", TONES[tone])}>
      {icon === "check" && <IconCheck size={12} />}
      {icon === "close" && <IconClose size={12} />}
      {label}
    </span>
  );
}

/** Figma underline tabs (Orders: Scanned / Not Scanned · Refunds: Upcoming / Processed / Rejected). */
export function UnderlineTabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex border-b border-white/15" role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative h-12 flex-1 whitespace-nowrap px-2 text-[16px] transition sm:h-14 sm:text-[20px]",
              active ? "font-medium text-accent" : "text-dim hover:text-text",
            )}
          >
            {t.label}
            {active && <span className="absolute inset-x-[10%] -bottom-px h-1 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

/** Figma scan tile: green check + "Scanned", or scan glyph + "Scan" (clickable). */
export function ScanTile({ scanned, onScan, refunded }: { scanned: boolean; onScan?: () => void; refunded?: boolean }) {
  const cls = "flex h-14 w-[128px] shrink-0 items-center justify-center gap-2 rounded-[18px] bg-[#262626] text-[16px] text-text sm:h-[80px] sm:w-[175px] sm:gap-3 sm:rounded-[22px] sm:text-[22px]";
  if (refunded) return <span className={cn(cls, "text-danger")}>Refunded</span>;
  if (scanned)
    return (
      <span className={cls}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#62b22f] text-white sm:h-8 sm:w-8">
          <IconCheck size={14} />
        </span>
        Scanned
      </span>
    );
  return (
    <button type="button" onClick={onScan} className={cn(cls, "transition hover:bg-surface-3")}>
      <IconScan size={26} className="h-5 w-5 sm:h-7 sm:w-7" />
      Scan
    </button>
  );
}

/** One ticket unit: type + "Scanned <time>" / "Scan <event time>" and the scan tile (Figma Ticket / Order screens). */
export function TicketUnitRow({
  name,
  scannedAt,
  eventAt,
  refunded,
  onScan,
}: {
  name: string;
  scannedAt?: string;
  eventAt: string;
  refunded?: boolean;
  onScan: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-[26px] bg-surface p-2 pl-5 sm:rounded-[30px] sm:pl-6">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[17px] font-bold text-text sm:text-[20px]">{name}</span>
        <span className="truncate text-[13px] text-text/90 sm:text-[15px]">{scannedAt ? `Scanned ${stamp(scannedAt)}` : `Scan ${stamp(eventAt)}`}</span>
      </div>
      <ScanTile scanned={!!scannedAt} refunded={refunded} onScan={onScan} />
    </li>
  );
}

/** FlowPage wrapper for the event-ops screens: resolves the event and handles loading / deleted events. */
export function OpsPage({
  id,
  width = "lg",
  title = "Back",
  asideClassName,
  children,
}: {
  id: string;
  width?: "md" | "lg" | "xl";
  /** Text next to the back arrow (Figma uses the screen name on some screens). */
  title?: string;
  asideClassName?: string;
  children: (event: EventItem) => ReactNode;
}) {
  const hydrated = useNest((s) => s.hydrated);
  const event = useNest((s) => s.events.find((e) => e.id === id));
  const back = `/organizer/events/${id}`;

  if (!hydrated) {
    return (
      <FlowPage title="Back" backHref={back} width={width}>
        <p className="text-dim">Loading…</p>
      </FlowPage>
    );
  }
  if (!event) {
    return (
      <FlowPage title="Back" backHref="/organizer/events" width={width}>
        <div className="flex flex-col items-start gap-4">
          <p className="text-lg text-text">This event no longer exists.</p>
          <Button variant="white" href="/organizer/events">
            Back to My Events
          </Button>
        </div>
      </FlowPage>
    );
  }
  return (
    <FlowPage title={title} backHref={back} width={width} asideClassName={asideClassName}>
      {children(event)}
    </FlowPage>
  );
}

export function OpsTitle({ children, event }: { children: ReactNode; event: EventItem }) {
  return (
    <DisplayTitle sub={event.title} className="[&_h1]:break-words">
      {children}
    </DisplayTitle>
  );
}
