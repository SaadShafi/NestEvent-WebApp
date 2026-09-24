"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode, type SVGProps } from "react";
import { money } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  maskAccount,
  parseMoney,
  sanitizeAmount,
  signedAmount,
  transactionTime,
  useWallet,
  type CardBrand,
  type WalletTransaction,
} from "@/lib/wallet-store";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { IconCalendar, IconMastercard } from "@/components/ui/icons";
import { Avatar, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

/* ------------------------------------------------------------------ */
/* Local icons (kept out of components/ui/icons.tsx on purpose) */
/* ------------------------------------------------------------------ */

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconWallet = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H5" />
    <path d="M17 14.5h.01" strokeWidth={2.6} />
  </svg>
);

export const IconBank = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 9.5 12 4l9 5.5M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8M3 20.5h18" />
  </svg>
);

export const IconReceipt = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
);

export const IconArrowUpRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const IconArrowDownLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p} strokeWidth={2}>
    <path d="M17 7 7 17M16 17H7V8" />
  </svg>
);

/** Brand glyph for a payment method (Mastercard reuses the shared two-circle mark). */
export function BrandIcon({ brand, size = 22 }: { brand: CardBrand; size?: number }) {
  if (brand === "mastercard") return <IconMastercard size={size * 1.3} />;
  const glyph: Record<Exclude<CardBrand, "mastercard">, ReactNode> = {
    visa: <span className="text-[11px] font-extrabold italic tracking-tight">VISA</span>,
    paypal: <span className="text-[15px] font-extrabold italic">P</span>,
    stripe: <span className="text-[15px] font-extrabold">S</span>,
    applepay: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8ZM14.1 5.8c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4Z" />
      </svg>
    ),
    googlepay: <span className="text-[15px] font-extrabold">G</span>,
  };
  return <span className="grid place-items-center text-text">{glyph[brand]}</span>;
}

/* ------------------------------------------------------------------ */
/* Hydration gate: wallet state lives in localStorage */
/* ------------------------------------------------------------------ */

export function WalletReady({ children }: { children: ReactNode }) {
  // `hydrated` is false in the server snapshot, so SSR and the first client render agree.
  const hydrated = useWallet((s) => s.hydrated);
  if (!hydrated) return <p className="py-10 text-center text-dim">Loading…</p>;
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* Pieces */
/* ------------------------------------------------------------------ */

export type TxTab = "completed" | "pending";
export const TX_TABS: { value: TxTab; label: string }[] = [
  { value: "completed", label: "Transactions" },
  { value: "pending", label: "Pending" },
];

/** Avatar + name/role on the left, signed amount + time on the right. */
export function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const positive = tx.amount >= 0;
  return (
    <div className="flex items-center gap-3 rounded-[22px] px-2 py-3 transition hover:bg-surface-2 sm:gap-4 sm:px-3">
      {tx.avatar ? (
        <Avatar src={tx.avatar} alt={tx.name} size={44} />
      ) : (
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          {positive ? <IconArrowDownLeft size={18} /> : <IconArrowUpRight size={18} />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-text">{tx.name}</p>
        <p className="truncate text-xs text-dim">{tx.role}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-[15px] font-semibold sm:text-base", positive ? "text-success" : "text-danger")}>{signedAmount(tx.amount)}</p>
        <p className="text-[11px] text-dim sm:text-xs">{transactionTime(tx.at)}</p>
      </div>
    </div>
  );
}

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** "Thursday, Nov 4, 2025" pill with a calendar icon; clicking opens the native date picker. */
export function DatePill({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  return (
    <label className="relative flex h-13 cursor-pointer items-center gap-3 rounded-full bg-surface px-5 transition hover:bg-surface-3">
      <span className="flex-1 truncate text-sm font-medium text-text">
        {value.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
      </span>
      <IconCalendar size={18} className="text-accent" />
      <input
        type="date"
        aria-label="Change date"
        value={toInputDate(value)}
        onChange={(e) => {
          if (!e.target.value) return;
          const [y, m, d] = e.target.value.split("-").map(Number);
          onChange(new Date(y, m - 1, d));
        }}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {
            /* unsupported: the native input still opens on focus */
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Withdraw modal (port of WithdrawSheet) */
/* ------------------------------------------------------------------ */

export function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Withdraw">
      {/* Remount per open so the form resets each time. */}
      {open && <WithdrawForm onClose={onClose} />}
    </Modal>
  );
}

function WithdrawForm({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const balance = useWallet((s) => s.balance);
  const bankAccounts = useWallet((s) => s.bankAccounts);
  const withdraw = useWallet((s) => s.withdraw);

  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState(() => bankAccounts.find((b) => b.isDefault)?.id ?? bankAccounts[0]?.id ?? "");
  const [errors, setErrors] = useState<{ amount?: string; bank?: string }>({});

  const options = useMemo(
    () => bankAccounts.map((b) => ({ value: b.id, label: `${b.holder} · ${maskAccount(b.number)}` })),
    [bankAccounts],
  );

  const submit = () => {
    const value = parseMoney(amount);
    const next: typeof errors = {};
    if (value <= 0) next.amount = "Enter an amount to withdraw";
    else if (value > balance) next.amount = `Amount exceeds your balance of ${money(balance)}`;
    if (!bankId) next.bank = "Select a bank account";
    setErrors(next);
    if (Object.keys(next).length) {
      toast(next.amount ?? next.bank ?? "Please check the form", "error");
      return;
    }
    withdraw(value, bankId);
    toast(`Withdrawal of ${money(value)} requested`, "success");
    onClose();
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="rounded-[22px] bg-surface-2 px-5 py-4">
        <p className="text-xs text-dim">Available balance</p>
        <p className="font-display text-[28px] font-bold text-accent">{money(balance)}</p>
      </div>
      <Field label="Amount" error={errors.amount}>
        <Input
          value={amount}
          onChange={(e) => {
            setAmount(sanitizeAmount(e.target.value));
            if (errors.amount) setErrors((x) => ({ ...x, amount: undefined }));
          }}
          inputMode="decimal"
          placeholder="0.00"
          left={<span>$</span>}
          invalid={!!errors.amount}
          autoFocus
        />
      </Field>
      <Field
        label="Bank account"
        error={errors.bank}
        hint={bankAccounts.length ? undefined : "Add a bank account first to withdraw."}
        action={
          <Link href="/organizer/wallet/bank-accounts/add" className="text-xs font-medium text-accent hover:underline">
            + Add bank
          </Link>
        }
      >
        <Select
          value={bankId}
          onChange={(e) => {
            setBankId(e.target.value);
            if (errors.bank) setErrors((x) => ({ ...x, bank: undefined }));
          }}
          options={options}
          placeholder="Select bank account"
          className={cn(errors.bank && "border-danger/60")}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        {[25, 50, 100].map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => setAmount(((Math.floor(balance * pct) / 100) || 0).toFixed(2))}
            className="h-9 rounded-full bg-surface px-4 text-xs font-medium text-muted transition hover:bg-surface-3 hover:text-text"
          >
            {pct === 100 ? "Max" : `${pct}%`}
          </button>
        ))}
      </div>
      <Button type="submit" variant="white" size="lg" block>
        Withdraw
      </Button>
    </form>
  );
}
