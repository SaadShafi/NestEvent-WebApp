"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { money } from "@/lib/data";
import { parseMoney, sanitizeAmount, useWallet } from "@/lib/wallet-store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/form";
import { IconCheck } from "@/components/ui/icons";
import { DisplayTitle, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { BrandIcon, WalletReady } from "../_components/wallet-ui";

const QUICK_AMOUNTS = [100, 200, 400, 1000];
const MAX_DEPOSIT = 1_000_000;

export default function DepositPage() {
  return (
    <FlowPage title="Back" backHref="/organizer/wallet/select-card" width="sm">
      <div className="flex flex-col gap-7">
        <DisplayTitle sub="Please enter the amount you want to deposit">Enter Amount</DisplayTitle>
        <Suspense fallback={null}>
          <WalletReady>
            <Deposit />
          </WalletReady>
        </Suspense>
      </div>
    </FlowPage>
  );
}

function Deposit() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const cards = useWallet((s) => s.cards);
  const deposit = useWallet((s) => s.deposit);
  const payment = cards.find((c) => c.id === params.get("method")) ?? cards[0];

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const value = parseMoney(amount);

  const submit = () => {
    let e = "";
    if (!payment) e = "Select a payment method first";
    else if (value <= 0) e = "Enter an amount to deposit";
    else if (value > MAX_DEPOSIT) e = `Maximum deposit is ${money(MAX_DEPOSIT)}`;
    setError(e);
    if (e) {
      toast(e, "error");
      return;
    }
    const rounded = Math.round(value * 100) / 100;
    deposit(rounded, payment!.id);
    setDone(rounded);
  };

  const finish = () => {
    setDone(null);
    toast("Deposit added to your wallet", "success");
    router.push("/organizer/wallet");
  };

  return (
    <>
      <form
        className="flex flex-col gap-6"
        onSubmit={(ev) => {
          ev.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col items-center gap-2 rounded-[28px] bg-surface-2 px-4 py-8 sm:py-10">
          <label className="flex max-w-full items-center justify-center gap-1">
            <span className="font-display text-[32px] font-bold text-muted">$</span>
            <input
              value={amount}
              onChange={(ev) => {
                setAmount(sanitizeAmount(ev.target.value));
                if (error) setError("");
              }}
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              aria-label="Deposit amount"
              aria-invalid={!!error}
              className="w-full min-w-0 max-w-[260px] bg-transparent text-center font-display text-[44px] font-extrabold text-text caret-accent placeholder:text-dimmer sm:text-[52px]"
            />
          </label>
          {error ? (
            <p className="text-center text-xs text-danger">{error}</p>
          ) : payment ? (
            <p className="text-center text-xs text-dim">
              via {payment.label}
              {payment.fee ? ` · ${payment.fee}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {QUICK_AMOUNTS.map((q) => (
            <Chip
              key={q}
              active={value === q}
              onClick={() => {
                setAmount(String(q));
                setError("");
              }}
            >
              ${q}
            </Chip>
          ))}
        </div>

        {payment && (
          <Link
            href="/organizer/wallet/select-card"
            className="flex items-center gap-3 rounded-full bg-surface px-5 py-3 transition hover:bg-surface-3"
          >
            <span className="grid w-8 shrink-0 place-items-center">
              <BrandIcon brand={payment.brand} size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-text">
              {payment.label}
              {payment.last4 ? ` · **** ${payment.last4}` : ""}
            </span>
            <span className="shrink-0 text-xs font-medium text-accent">Change</span>
          </Link>
        )}

        <Button type="submit" variant="white" size="lg" block>
          Deposit
        </Button>
      </form>

      <Modal open={done != null} onClose={finish} hideClose>
        <div className="flex flex-col items-center pt-2 text-center">
          <span className="mb-5 grid h-[76px] w-[76px] place-items-center rounded-full bg-success text-white">
            <IconCheck size={36} />
          </span>
          <h2 className="font-display text-[26px] font-bold text-text">Deposit successful</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">{money(done ?? 0)} has been added to your wallet balance.</p>
          <p className="my-5 font-display text-[40px] font-extrabold text-text">{money(done ?? 0)}</p>
          <Button type="button" variant="white" size="lg" block onClick={finish}>
            Back to Wallet
          </Button>
        </div>
      </Modal>
    </>
  );
}
