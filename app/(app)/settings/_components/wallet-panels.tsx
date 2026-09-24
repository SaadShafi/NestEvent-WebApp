"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet-store";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { IconChevronRight } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconBank, TransactionRow, TX_TABS, WalletReady, WithdrawModal, type TxTab } from "@/app/(flow)/organizer/wallet/_components/wallet-ui";

const ACCOUNT_TYPES = [
  { value: "Checking", label: "Checking" },
  { value: "Savings", label: "Savings" },
];

/** Dark inputs used inside the Settings panel (the panel itself is #141414). */
const PANEL_INPUT = "h-12! bg-[#0d0d0d]! border-white/10! text-[13px]!";

/* ------------------------------------------------------------------ */
/* Bank Accounts (Figma: saved account cards + "Add Bank Details" form) */
/* ------------------------------------------------------------------ */

export function BankAccountsPanel() {
  return (
    <WalletReady>
      <BankAccounts />
    </WalletReady>
  );
}

function BankAccounts() {
  const toast = useToast();
  const accounts = useWallet((s) => s.bankAccounts);
  const addBankAccount = useWallet((s) => s.addBankAccount);
  const setDefaultBank = useWallet((s) => s.setDefaultBank);

  const [holder, setHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [number, setNumber] = useState("");
  const [accountType, setAccountType] = useState("");
  const [routing, setRouting] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!holder.trim()) next.holder = "Enter the account holder's full name";
    if (!bankName.trim()) next.bankName = "Enter the bank name";
    if (number.replace(/[^0-9a-z]/gi, "").length < 8) next.number = "Enter a valid account number / IBAN";
    if (!accountType) next.accountType = "Choose an account type";
    if (routing && routing.replace(/[^0-9a-z]/gi, "").length < 6) next.routing = "Enter a valid routing / SWIFT number";
    setErrors(next);
    if (Object.keys(next).length) return toast("Please fix the highlighted fields", "error");
    addBankAccount(
      { holder: holder.trim(), bankName: bankName.trim(), number: number.replace(/\s+/g, "").toUpperCase(), accountType, routing: routing.trim() || undefined },
      remember,
    );
    toast("Bank account added", "success");
    setHolder("");
    setBankName("");
    setNumber("");
    setAccountType("");
    setRouting("");
  };

  return (
    <div className="flex flex-col gap-5">
      {accounts.length > 0 && (
        <ul className="flex flex-col gap-3">
          {accounts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  if (!a.isDefault) {
                    setDefaultBank(a.id);
                    toast(`${a.bankName ?? a.holder} set as default`, "success");
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[18px] border bg-[#0d0d0d] px-4 py-3 text-left transition",
                  a.isDefault ? "border-accent/40" : "border-transparent hover:border-white/10",
                )}
                aria-pressed={a.isDefault}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2a1a0c] text-accent">
                  <IconBank size={20} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15px] font-semibold text-text">{a.holder}</span>
                  <span className="truncate text-xs text-dim">
                    {a.number}
                    {a.bankName ? ` · ${a.bankName}` : ""}
                  </span>
                </span>
                <span className={cn("h-3 w-3 shrink-0 rounded-full", a.isDefault ? "bg-accent" : "border border-white/30")} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <div className="mb-1">
          <h3 className="text-[16px] font-semibold text-text">Add Bank Details</h3>
          <p className="text-xs text-dim">Please Enter The Bank Details</p>
        </div>
        <Field error={errors.holder}>
          <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Full Name" invalid={!!errors.holder} className={PANEL_INPUT} autoComplete="name" />
        </Field>
        <Field error={errors.bankName}>
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" invalid={!!errors.bankName} className={PANEL_INPUT} />
        </Field>
        <Field error={errors.number}>
          <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Account Number" invalid={!!errors.number} className={PANEL_INPUT} inputMode="text" />
        </Field>
        <Field error={errors.accountType}>
          <Select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            placeholder="Account Type"
            options={ACCOUNT_TYPES}
            className={cn(PANEL_INPUT, !accountType && "text-dim!")}
            aria-label="Account Type"
          />
        </Field>
        <Field error={errors.routing}>
          <Input value={routing} onChange={(e) => setRouting(e.target.value)} placeholder="Routing Number" invalid={!!errors.routing} className={PANEL_INPUT} />
        </Field>
        <Checkbox checked={remember} onChange={setRemember} label="Remember This Card" className="mt-1 text-xs" />
        <Button type="submit" variant="white" block className="mt-3 h-12!">
          Continue
        </Button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wallet (Figma: balance + Withdraw, My Transactions History, Transactions / Pending) */
/* ------------------------------------------------------------------ */

export function WalletPanel() {
  return (
    <WalletReady>
      <Wallet />
    </WalletReady>
  );
}

function Wallet() {
  const balance = useWallet((s) => s.balance);
  const transactions = useWallet((s) => s.transactions);
  const [tab, setTab] = useState<TxTab>("completed");
  const [withdraw, setWithdraw] = useState(false);

  const list = transactions.filter((t) => t.status === tab);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[#0d0d0d] px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs text-muted">Account Balance</p>
          <p className="truncate text-[24px] font-bold text-text sm:text-[28px]">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <Button size="sm" onClick={() => setWithdraw(true)} className="shrink-0 px-5">
          Withdraw
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-text">
          My Transactions History
          <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        </h3>
        <Link
          href="/organizer/wallet/transactions"
          className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white transition hover:brightness-110"
          aria-label="Open full transaction history"
          title="Full history"
        >
          <IconChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-full bg-[#0d0d0d] p-1" role="tablist">
        {TX_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={cn("h-10 rounded-full text-[13px] font-medium transition", tab === t.value ? "bg-accent text-white" : "text-muted hover:text-text")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title={tab === "pending" ? "No pending transactions" : "No transactions yet"} />
      ) : (
        <div className="flex flex-col">
          {list.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}

      <WithdrawModal open={withdraw} onClose={() => setWithdraw(false)} />
    </div>
  );
}
