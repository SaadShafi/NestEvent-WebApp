"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { money } from "@/lib/data";
import { maskAccount, useWallet } from "@/lib/wallet-store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/form";
import { IconChevronRight } from "@/components/ui/icons";
import { DisplayTitle, EmptyState } from "@/components/ui/primitives";
import {
  IconBank,
  IconReceipt,
  IconWallet,
  TX_TABS,
  TransactionRow,
  WalletReady,
  WithdrawModal,
  type TxTab,
} from "./_components/wallet-ui";

const PREVIEW_COUNT = 6;

export default function WalletPage() {
  return (
    <FlowPage title="Back" backHref="/settings" width="lg">
      <div className="flex flex-col gap-7">
        <DisplayTitle>My Wallet</DisplayTitle>
        <WalletReady>
          <Wallet />
        </WalletReady>
      </div>
    </FlowPage>
  );
}

function Wallet() {
  const balance = useWallet((s) => s.balance);
  const transactions = useWallet((s) => s.transactions);
  const bankAccounts = useWallet((s) => s.bankAccounts);
  const [tab, setTab] = useState<TxTab>("completed");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const rows = useMemo(() => transactions.filter((t) => t.status === tab).slice(0, PREVIEW_COUNT), [transactions, tab]);
  const pendingCount = useMemo(() => transactions.filter((t) => t.status === "pending").length, [transactions]);
  const defaultBank = bankAccounts.find((b) => b.isDefault);

  return (
    <>
      {/* Balance card */}
      <div className="relative overflow-hidden rounded-[28px] bg-surface-2 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(215deg, rgba(255,107,0,0.55) 0%, rgba(255,107,0,0.12) 40%, transparent 75%)" }}
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black/35 text-accent">
                <IconWallet size={17} />
              </span>
              <span className="text-sm text-muted">Account balance</span>
            </div>
            <p className="mt-3 break-words font-display text-[40px] font-extrabold leading-none tracking-tight text-text sm:text-[52px]">
              {money(balance)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-[320px] md:shrink-0">
            <Button variant="white" block onClick={() => setWithdrawOpen(true)}>
              Withdraw
            </Button>
            <Button variant="primary" block href="/organizer/wallet/select-card" className="w-full">
              Deposit
            </Button>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Shortcut
          href="/organizer/wallet/bank-accounts"
          icon={<IconBank size={20} />}
          title="Bank Accounts"
          sub={defaultBank ? `${defaultBank.bankName ?? defaultBank.holder} · ${maskAccount(defaultBank.number)}` : "Add a payout account"}
        />
        <Shortcut
          href="/organizer/wallet/transactions"
          icon={<IconReceipt size={20} />}
          title="Transactions History"
          sub={pendingCount ? `${pendingCount} pending` : "All caught up"}
        />
      </div>

      {/* History preview */}
      <div className="flex flex-col gap-4">
        <PillTabs<TxTab> size="md" tabs={TX_TABS} value={tab} onChange={setTab} className="max-w-[420px]" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text">My Transactions History</h2>
          <Link href="/organizer/wallet/transactions" className="shrink-0 text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            title={tab === "pending" ? "Nothing pending" : "No transactions yet"}
            sub={tab === "pending" ? "Deposit and withdrawal requests will show up here." : "Ticket payouts and transfers will show up here."}
          />
        ) : (
          <div className="flex flex-col">
            {rows.map((t) => (
              <TransactionRow key={t.id} tx={t} />
            ))}
          </div>
        )}
      </div>

      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </>
  );
}

function Shortcut({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 rounded-[24px] bg-surface-2 p-4 transition hover:bg-surface">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-text">{title}</span>
        <span className="block truncate text-xs text-dim">{sub}</span>
      </span>
      <IconChevronRight size={18} className="shrink-0 text-dim transition group-hover:text-text" />
    </Link>
  );
}
