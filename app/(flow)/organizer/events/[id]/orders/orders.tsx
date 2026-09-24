"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatEventDate } from "@/lib/data";
import type { EventItem } from "@/lib/types";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { IconChevronRight } from "@/components/ui/icons";
import { ticketCount, ticketLabel, ticketUnits, useEventOps } from "../_lib/event-ops";
import { OpsPage, UnderlineTabs } from "../_lib/ops-ui";

type Tab = "scanned" | "not";
const TABS: { value: Tab; label: string }[] = [
  { value: "scanned", label: "Scanned" },
  { value: "not", label: "Not Scanned" },
];

export function Orders({ id }: { id: string }) {
  return (
    <OpsPage id={id} title="Orders" width="md">
      {(event) => <OrdersList event={event} />}
    </OpsPage>
  );
}

/** Orders (Figma): Scanned / Not Scanned tabs, one card per order → Orders #NG… detail. */
function OrdersList({ event }: { event: EventItem }) {
  const { orders, scans } = useEventOps(event);
  const [tab, setTab] = useState<Tab>("scanned");

  const rows = useMemo(
    () =>
      orders
        .filter((o) => o.refund !== "refunded")
        .filter((o) => {
          const scanned = ticketUnits(o).some((u) => scans[u.key]);
          return tab === "scanned" ? scanned : !scanned;
        }),
    [orders, scans, tab],
  );

  return (
    <div className="flex max-w-[640px] flex-col gap-8">
      <UnderlineTabs tabs={TABS} value={tab} onChange={setTab} />

      {rows.length === 0 ? (
        <EmptyState
          title={tab === "scanned" ? "No scanned tickets yet" : "Every order is scanned"}
          sub={tab === "scanned" ? "Orders appear here once one of their tickets is scanned at the door." : "Nothing left to check in."}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {rows.map((order) => {
            const qty = ticketCount(order);
            return (
              <Link
                key={order.id}
                href={`/organizer/events/${event.id}/orders/${order.id}`}
                className="flex items-center gap-4 rounded-[30px] bg-surface px-5 py-5 transition hover:bg-surface-3 sm:rounded-[34px] sm:px-7"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar src={order.buyerAvatar} alt={order.buyerName} size={70} className="max-sm:!h-14 max-sm:!w-14" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[18px] font-semibold text-text sm:text-[22px]">{order.buyerName}</span>
                      <span className="truncate text-[13px] text-text/90 sm:text-[16px]">
                        {qty} {qty === 1 ? "Ticket" : "Tickets"} · {order.number}
                      </span>
                      <span className="truncate text-[13px] text-text/90 sm:text-[16px]">{formatEventDate(event)}</span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[17px] font-bold text-text sm:text-[21px]">Ticket Type</span>
                    <span className="truncate text-[13px] text-text/90 sm:text-[16px]">{ticketLabel(order)}</span>
                  </div>
                </div>
                <IconChevronRight size={26} className="shrink-0 text-text/80" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
