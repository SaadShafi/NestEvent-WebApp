"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SuccessScreen } from "@/components/shell/success-screen";
import { Button } from "@/components/ui/button";
import { useNest } from "@/lib/store";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-bg text-dim">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const orderId = params.get("order");
  // "View Ticket" opens the purchased ticket itself (first ticket of the order).
  const firstTicket = useNest((s) => s.orders.find((o) => o.id === orderId)?.tickets[0]);
  const ticketHref = orderId ? (firstTicket ? `/tickets/${orderId}/${firstTicket.id}` : `/tickets/${orderId}`) : "/tickets";
  return (
    <SuccessScreen
      title={
        <>
          Checkout
          <br />
          Successfully
        </>
      }
      sub="Enjoy Events picked based on your interests and location"
      actions={
        <>
          <Button variant="white" href="/dashboard">
            Back to Home
          </Button>
          <Button href={ticketHref}>View Ticket</Button>
        </>
      }
    />
  );
}
