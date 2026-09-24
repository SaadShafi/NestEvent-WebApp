"use client";

import { useMemo, useState } from "react";
import { sameDay, useWallet } from "@/lib/wallet-store";
import { FlowPage } from "@/components/shell/flow-layout";
import { PillTabs } from "@/components/ui/form";
import { DisplayTitle, EmptyState } from "@/components/ui/primitives";
import { DatePill, TX_TABS, TransactionRow, WalletReady, type TxTab } from "../_components/wallet-ui";

export default function TransactionsPage() {
  return (
    <FlowPage title="Back" backHref="/organizer/wallet" width="md">
      <div className="flex flex-col gap-7">
        <DisplayTitle>
          Transactions
          <br />
          History
        </DisplayTitle>
        <WalletReady>
          <Transactions />
        </WalletReady>
      </div>
    </FlowPage>
  );
}

function Transactions() {
  const transactions = useWallet((s) => s.transactions);
  const [tab, setTab] = useState<TxTab>("completed");
  const [date, setDate] = useState(() => new Date());

  const rows = useMemo(
    () => transactions.filter((t) => t.status === tab && sameDay(new Date(t.at), date)),
    [transactions, tab, date],
  );
  const isToday = sameDay(date, new Date());
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <DatePill value={date} onChange={setDate} />
        </div>
        {!isToday && (
          <button
            type="button"
            onClick={() => setDate(new Date())}
            className="h-11 shrink-0 self-start rounded-full bg-surface px-5 text-sm font-medium text-muted transition hover:bg-surface-3 hover:text-text sm:self-auto"
          >
            Today
          </button>
        )}
      </div>
      <PillTabs<TxTab> size="md" tabs={TX_TABS} value={tab} onChange={setTab} />
      {rows.length === 0 ? (
        <EmptyState
          title={tab === "pending" ? "Nothing pending" : "No transactions"}
          sub={`No ${tab === "pending" ? "pending requests" : "transactions"} on ${label}.`}
        />
      ) : (
        <div className="flex flex-col">
          {rows.map((t) => (
            <TransactionRow key={t.id} tx={t} />
          ))}
        </div>
      )}
    </div>
  );
}
