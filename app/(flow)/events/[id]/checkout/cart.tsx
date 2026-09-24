"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { money } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { CartLine, TicketType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

const TAX_RATE = 0.0102;

function meta(t: TicketType) {
  const parts = [`$${t.price}`, `Qty ${t.quantity.toLocaleString("en-US")}`, `Max ${t.maxPerOrder}`];
  if (t.ageRestriction) parts.push(t.ageRestriction);
  if (t.saleEnds) parts.push(`Sale ends ${t.saleEnds}`);
  return parts.join(" · ");
}

export function Cart({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const event = useNest((s) => s.events.find((e) => e.id === id));
  const cart = useNest((s) => s.cart);
  const setCart = useNest((s) => s.setCart);

  const [busy, setBusy] = useState(false);

  // the persisted cart is the single source of truth for quantities
  const qty = useMemo<Record<string, number>>(
    () => (cart && cart.eventId === id ? Object.fromEntries(cart.lines.map((l) => [l.ticketTypeId, l.qty])) : {}),
    [cart, id],
  );

  const lines: CartLine[] = useMemo(
    () => (event?.ticketTypes ?? []).map((t) => ({ ticketTypeId: t.id, qty: qty[t.id] ?? 0 })).filter((l) => l.qty > 0),
    [event, qty],
  );
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = lines.reduce((a, l) => a + l.qty * (event?.ticketTypes.find((t) => t.id === l.ticketTypeId)?.price ?? 0), 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  if (!event) {
    return (
      <FlowPage title="Cart" backHref="/dashboard" width="md">
        <EmptyState title="Event not found" action={<Button href="/dashboard">Back to Dashboard</Button>} />
      </FlowPage>
    );
  }

  const change = (t: TicketType, v: number) => {
    const next = { ...qty, [t.id]: v };
    setCart(
      event.id,
      event.ticketTypes.map((x) => ({ ticketTypeId: x.id, qty: next[x.id] ?? 0 })),
    );
  };

  const checkout = () => {
    if (count === 0) {
      toast("Add at least one ticket to continue", "error");
      return;
    }
    setCart(event.id, lines);
    setBusy(true);
    // Cart → Checkout (delivery address, order summary, promo, payment) → Checkout Successfully.
    router.push("/checkout");
  };

  return (
    <FlowPage title="Cart" backHref={`/events/${event.id}`} width="full">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,440px)] xl:gap-24">
        <div className="flex flex-col gap-4">
          {event.ticketTypes.length === 0 && <EmptyState title="No tickets available" sub="This event has no ticket types yet." />}
          {event.ticketTypes.map((t) => {
            const v = qty[t.id] ?? 0;
            return (
              <div
                key={t.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-4 rounded-[24px] border bg-surface-2 px-5 py-5 transition sm:flex-nowrap sm:px-7 sm:py-6",
                  v > 0 ? "border-accent" : "border-transparent",
                )}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-[22px] font-semibold text-text">{t.name}</p>
                  <p className="text-[14px] text-muted">{meta(t)}</p>
                </div>
                <Counter value={v} onChange={(n) => change(t, n)} min={0} max={t.maxPerOrder} />
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-[28px] bg-surface-2">
          <div className="flex flex-col gap-3 px-5 pb-6 pt-7">
            <h2 className="mb-1 text-[22px] font-semibold text-text">Order Summary</h2>
            <Row label="Quantity" value={String(count)} />
            <Row label="Tax fee" value={money(tax)} />
            <Row label="Ticket Price" value={money(subtotal)} />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[22px] font-semibold text-text">Total Payment</span>
              <span className="text-[22px] font-semibold text-text">{money(total)}</span>
            </div>
          </div>
          <div className="bg-surface px-3 py-3">
            <Button block size="lg" onClick={checkout} loading={busy}>
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </FlowPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
