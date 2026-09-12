"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SuccessScreen } from "@/components/shell/success-screen";
import { Button } from "@/components/ui/button";

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
          <Button href={orderId ? `/tickets/${orderId}` : "/tickets"}>View Ticket</Button>
        </>
      }
    />
  );
}
