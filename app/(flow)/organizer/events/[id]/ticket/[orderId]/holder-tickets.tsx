"use client";

import type { EventItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { ticketUnits, useEventOps } from "../../_lib/event-ops";
import { OpsPage, TicketUnitRow } from "../../_lib/ops-ui";

export function HolderTickets({ id, orderId }: { id: string; orderId: string }) {
  return <OpsPage id={id} title="Ticket" width="md">{(event) => <Holder event={event} orderId={orderId} />}</OpsPage>;
}

/** Ticket (Figma, after scanning a guest): holder header and every ticket they hold for this event. */
function Holder({ event, orderId }: { event: EventItem; orderId: string }) {
  const { orders, scans, markScanned } = useEventOps(event);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <EmptyState
        title="Ticket not found"
        sub="This ticket may have been refunded or removed."
        action={<Button href={`/organizer/events/${event.id}/scan`}>Back to Scan</Button>}
      />
    );
  }

  const units = orders.filter((o) => o.buyerName === order.buyerName).flatMap(ticketUnits);
  const eventAt = `${event.startDate}T${event.startTime || "00:00"}`;

  return (
    <div className="flex w-full max-w-[518px] flex-col gap-5">
      <div className="mb-1 flex items-center gap-5">
        <Avatar src={order.buyerAvatar} alt={order.buyerName} size={90} className="max-sm:!h-[72px] max-sm:!w-[72px]" />
        <h2 className="max-w-[260px] text-[24px] font-semibold leading-tight text-text sm:text-[32px]">{order.buyerName}</h2>
      </div>
      <ul className="flex flex-col gap-5">
        {units.map((u) => (
          <TicketUnitRow
            key={u.key}
            name={u.ticket.ticketTypeName}
            scannedAt={scans[u.key]}
            eventAt={eventAt}
            refunded={u.order.refund === "refunded"}
            onScan={() => markScanned(u.key)}
          />
        ))}
      </ul>
    </div>
  );
}
