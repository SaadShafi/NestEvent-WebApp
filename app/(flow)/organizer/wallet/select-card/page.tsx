"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@/lib/wallet-store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { DisplayTitle } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { BrandIcon, WalletReady } from "../_components/wallet-ui";

export default function SelectCardPage() {
  return (
    <FlowPage title="Back" backHref="/organizer/wallet" width="sm">
      <div className="flex flex-col gap-7">
        <DisplayTitle sub="Choose how you want to fund your wallet.">Select Card</DisplayTitle>
        <WalletReady>
          <SelectCard />
        </WalletReady>
      </div>
    </FlowPage>
  );
}

function SelectCard() {
  const router = useRouter();
  const cards = useWallet((s) => s.cards);
  const [selected, setSelected] = useState(cards[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Payment method">
        {cards.map((m) => {
          const active = m.id === selected;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(m.id)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-full border-[1.5px] bg-surface px-4 py-2 text-left transition sm:px-5",
                active ? "border-accent" : "border-transparent hover:bg-surface-3",
              )}
            >
              <span className="grid w-10 shrink-0 place-items-center">
                <BrandIcon brand={m.brand} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-text">{m.label}</span>
                {m.last4 && <span className="block truncate text-xs text-dim">**** **** **** {m.last4}</span>}
              </span>
              {m.fee && <span className="hidden shrink-0 text-xs text-dim min-[380px]:inline">{m.fee}</span>}
              <span
                aria-hidden
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                  active ? "border-accent" : "border-dim",
                )}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
            </button>
          );
        })}
      </div>
      <Button
        variant="white"
        size="lg"
        block
        disabled={!selected}
        onClick={() => router.push(`/organizer/wallet/deposit?method=${encodeURIComponent(selected)}`)}
      >
        Continue
      </Button>
    </div>
  );
}
