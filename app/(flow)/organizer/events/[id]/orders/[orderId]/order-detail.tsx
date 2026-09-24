"use client";

import { formatEventDate } from "@/lib/data";
import type { EventItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { orderNumber, ticketCount, ticketUnits, useEventOps } from "../../_lib/event-ops";
import { OpsPage, TicketUnitRow } from "../../_lib/ops-ui";

export function OrderDetail({ id, orderId }: { id: string; orderId: string }) {
  return (
    <OpsPage id={id} title={`Orders ${orderNumber(orderId)}`} width="xl" asideClassName="md:w-auto!">
      {(event) => <Detail event={event} orderId={orderId} />}
    </OpsPage>
  );
}

/** Orders #NG… (Figma): centred holder header, then every ticket in the order with Scanned / Scan. */
function Detail({ event, orderId }: { event: EventItem; orderId: string }) {
  const { orders, scans, markScanned } = useEventOps(event);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        sub="This order may have been refunded or removed."
        action={<Button href={`/organizer/events/${event.id}/orders`}>Back to Orders</Button>}
      />
    );
  }

  const qty = ticketCount(order);
  const eventAt = `${event.startDate}T${event.startTime || "00:00"}`;

  return (
    <div className="mx-auto flex w-full max-w-[596px] flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar src={order.buyerAvatar} alt={order.buyerName} size={168} className="max-sm:!h-32 max-sm:!w-32" />
        <h2 className="mt-2 text-[26px] font-semibold leading-tight text-text sm:text-[32px]">{order.buyerName}</h2>
        <p className="text-[15px] text-text/90 sm:text-[16px]">
          {qty} {qty === 1 ? "Ticket" : "Tickets"} · {order.number}
        </p>
        <p className="text-[15px] text-text/90 sm:text-[16px]">{formatEventDate(event)}</p>
      </div>
      <ul className="flex w-full flex-col gap-5">
        {ticketUnits(order).map((u) => (
          <TicketUnitRow
            key={u.key}
            name={u.ticket.ticketTypeName}
            scannedAt={scans[u.key]}
            eventAt={eventAt}
            refunded={order.refund === "refunded"}
            onScan={() => markScanned(u.key)}
          />
        ))}
      </ul>
    </div>
  );
}
