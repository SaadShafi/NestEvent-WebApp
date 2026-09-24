"use client";

import Link from "next/link";
import { formatEventDate } from "@/lib/data";
import { useNest } from "@/lib/store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

/** "Ticket Order": every ticket the guest holds for this order's event, each opening its QR ticket. */
export function OrderTickets({ orderId }: { orderId: string }) {
  const order = useNest((s) => s.orders.find((o) => o.id === orderId));
  const event = useNest((s) => (order ? s.events.find((e) => e.id === order.eventId) : undefined));
  const orders = useNest((s) => s.orders);

  if (!order || !event) {
    return (
      <FlowPage title="Ticket Order" backHref="/tickets" width="sm" stacked>
        <EmptyState title="Ticket not found" sub="We couldn't find this order." action={<Button href="/tickets">My Tickets</Button>} />
      </FlowPage>
    );
  }

  const lines = orders.filter((o) => o.eventId === event.id).flatMap((o) => o.tickets.map((t) => ({ order: o, ticket: t })));

  return (
    <FlowPage title="Ticket Order" width="sm" stacked>
      <div className="flex flex-col gap-4">
        <p className="px-1 text-sm text-dim">{event.title}</p>
        {lines.map(({ order: o, ticket: t }) => (
          <Link
            key={t.id}
            href={`/tickets/${o.id}/${t.id}`}
            className="group relative flex flex-col gap-2 rounded-[28px] bg-surface-2 px-5 pb-6 pt-5 transition hover:bg-surface-3 sm:px-8 sm:pb-7 sm:pt-6"
          >
            <span className="absolute right-4 top-4 rounded-full bg-accent-gradient px-3.5 py-2 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(255,106,0,0.25)] sm:right-6 sm:top-5 sm:px-4 sm:py-2.5 sm:text-[16px]">
              {t.qty} {t.qty === 1 ? "Ticket" : "Tickets"}
            </span>
            <span className="pr-28 text-[20px] font-semibold text-text sm:pr-32 sm:text-[22px]">{t.ticketTypeName}</span>
            <span className="text-[14px] text-muted sm:text-[15px]">
              ${t.unitPrice} · {formatEventDate(event)}
            </span>
            <span className="mt-3 text-[16px] font-semibold text-text group-hover:text-accent">View Tickets</span>
          </Link>
        ))}
      </div>
    </FlowPage>
  );
}
