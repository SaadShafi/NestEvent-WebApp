"use client";

import Link from "next/link";
import { formatEventDate } from "@/lib/data";
import { useNest } from "@/lib/store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

export function OrderTickets({ orderId }: { orderId: string }) {
  const order = useNest((s) => s.orders.find((o) => o.id === orderId));
  const event = useNest((s) => (order ? s.events.find((e) => e.id === order.eventId) : undefined));

  if (!order || !event) {
    return (
      <FlowPage title="Ticket" backHref="/tickets" width="sm">
        <EmptyState title="Ticket not found" sub="We couldn't find this order." action={<Button href="/tickets">My Tickets</Button>} />
      </FlowPage>
    );
  }

  return (
    <FlowPage title="Ticket" backHref="/tickets" width="sm">
      <div className="flex flex-col gap-4">
        <p className="px-1 text-sm text-dim">{event.title}</p>
        {order.tickets.map((t) => (
          <Link
            key={t.id}
            href={`/tickets/${order.id}/${t.id}`}
            className="group relative flex flex-col gap-2 rounded-[28px] bg-surface-2 px-8 pb-7 pt-6 transition hover:bg-surface-3"
          >
            <span className="absolute right-6 top-5 rounded-full bg-accent-gradient px-4 py-2.5 text-[16px] font-semibold text-white shadow-[0_8px_24px_rgba(255,106,0,0.25)]">
              {t.qty} {t.qty === 1 ? "Ticket" : "Tickets"}
            </span>
            <span className="text-[22px] font-semibold text-text">{t.ticketTypeName}</span>
            <span className="text-[15px] text-muted">
              ${t.unitPrice} · {formatEventDate(event)}
            </span>
            <span className="mt-3 text-[16px] font-semibold text-text group-hover:text-accent">View Tickets</span>
          </Link>
        ))}
      </div>
    </FlowPage>
  );
}
