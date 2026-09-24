"use client";

import Image from "next/image";
import { money } from "@/lib/data";
import { useNest } from "@/lib/store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { IconVerified } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/primitives";
import { QrActions, QrCanvas } from "@/components/ui/qr-code";

function shortCountry(c?: string) {
  if (!c) return "";
  if (/^(usa|united states)/i.test(c)) return "US";
  return c;
}

export function QrTicket({ orderId, ticketId }: { orderId: string; ticketId: string }) {
  const order = useNest((s) => s.orders.find((o) => o.id === orderId));
  const event = useNest((s) => (order ? s.events.find((e) => e.id === order.eventId) : undefined));
  const ticket = order?.tickets.find((t) => t.id === ticketId);

  if (!order || !event || !ticket) {
    return (
      <FlowPage title="Ticket" backHref="/tickets" width="sm" stacked>
        <EmptyState title="Ticket not found" action={<Button href="/tickets">My Tickets</Button>} />
      </FlowPage>
    );
  }

  const place = [event.venue, [event.location.city, shortCountry(event.location.country)].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(", in ");
  const cost = ticket.qty * ticket.unitPrice;

  return (
    <FlowPage title="Ticket" backHref={`/tickets/${order.id}`} width="sm" stacked>
      {/* ticket centred on the screen */}
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4">
        {/* Poster header */}
        <div className="relative h-[215px] overflow-hidden rounded-[28px] bg-surface-2">
          <Image src={event.cover} alt="" fill sizes="420px" className="object-cover" priority />
          <div className="absolute inset-x-3 bottom-3 rounded-[20px] bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-4 pt-8">
            <span className="mb-2 inline-flex rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-white">
              {ticket.qty} {ticket.qty === 1 ? "Ticket" : "Tickets"}
            </span>
            <p className="flex items-center gap-2 text-[22px] font-semibold text-text">
              <span className="line-clamp-1">{event.title}</span>
              <IconVerified size={18} className="shrink-0 text-accent" />
            </p>
          </div>
        </div>

        {/* Ticket body */}
        <div className="ticket-notch relative rounded-[28px] bg-surface-2 px-4 pb-6 pt-5">
          <p className="text-[12px] text-dim">Place</p>
          <p className="mt-1 text-[16px] text-text">{place}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat value={String(ticket.qty)} label="Person" />
            <Stat value={ticket.ticketTypeName} label="Class" />
            <Stat value={money(cost).replace(/\.00$/, "")} label="Cost" />
          </div>
          <p className="mt-7 text-center text-[12px] text-dim">Scan this QR Code</p>
          <div className="mx-2 mt-2 border-t border-dashed border-[#3a3a3a]" />
          <div className="mt-4 flex flex-col items-center gap-2">
            <QrCanvas value={ticket.code} size={150} />
            <p className="font-mono text-[11px] tracking-wider text-dim">{ticket.code}</p>
          </div>
        </div>

        <div className="mt-6">
          <QrActions
            value={ticket.code}
            title={event.title}
            subtitle={`${ticket.qty} × ${ticket.ticketTypeName} · ${event.venue}`}
            fileName={`nest-ticket-${ticket.code}.png`}
          />
        </div>
      </div>
    </FlowPage>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] bg-bg px-2 py-4">
      <span className="line-clamp-1 max-w-full text-[18px] text-text sm:text-[22px]">{value}</span>
      <span className="text-[12px] text-dim">{label}</span>
    </div>
  );
}
