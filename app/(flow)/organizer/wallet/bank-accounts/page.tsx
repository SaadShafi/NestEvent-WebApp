"use client";

import { useState } from "react";
import { maskAccount, useWallet, type BankAccount } from "@/lib/wallet-store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { Badge, DisplayTitle, EmptyState, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { IconBank, WalletReady } from "../_components/wallet-ui";

export default function BankAccountsPage() {
  return (
    <FlowPage title="Back" backHref="/settings" width="md">
      <div className="flex flex-col gap-7">
        <DisplayTitle sub="Saved payout accounts. Select one to make it your default for withdrawals.">Bank Accounts</DisplayTitle>
        <WalletReady>
          <BankAccounts />
        </WalletReady>
      </div>
    </FlowPage>
  );
}

function BankAccounts() {
  const toast = useToast();
  const bankAccounts = useWallet((s) => s.bankAccounts);
  const setDefaultBank = useWallet((s) => s.setDefaultBank);
  const removeBankAccount = useWallet((s) => s.removeBankAccount);
  const [removing, setRemoving] = useState<BankAccount | null>(null);

  const makeDefault = (b: BankAccount) => {
    if (b.isDefault) return;
    setDefaultBank(b.id);
    toast(`${b.bankName ?? b.holder} set as default`, "success");
  };

  const confirmRemove = () => {
    if (!removing) return;
    removeBankAccount(removing.id);
    toast("Bank account removed", "success");
    setRemoving(null);
  };

  return (
    <>
      {bankAccounts.length === 0 ? (
        <EmptyState title="No bank accounts" sub="Add a bank account to withdraw your earnings." />
      ) : (
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Default bank account">
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              className={cn(
                "flex items-center gap-3 rounded-[24px] border bg-surface-2 p-3 pr-4 transition sm:gap-4 sm:p-4",
                b.isDefault ? "border-accent/70" : "border-transparent hover:bg-surface",
              )}
            >
              <button
                type="button"
                role="radio"
                aria-checked={b.isDefault}
                onClick={() => makeDefault(b)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black text-accent">
                  <IconBank size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-semibold text-text">{b.holder}</span>
                    {b.isDefault && <Badge className="h-6 shrink-0 px-2.5 text-[11px]">Default</Badge>}
                  </span>
                  <span className="block truncate text-xs text-dim">
                    {b.bankName ? `${b.bankName} · ` : ""}
                    {maskAccount(b.number)}
                    {b.routing ? ` · ${b.routing}` : ""}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                    b.isDefault ? "border-accent" : "border-dim",
                  )}
                >
                  {b.isDefault && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRemoving(b)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-dim transition hover:bg-[#2a1616] hover:text-danger"
                aria-label={`Remove ${b.holder} account`}
              >
                <IconTrash size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button variant="white" size="lg" block href="/organizer/wallet/bank-accounts/add" icon={<IconPlus size={18} />}>
        Add Bank Details
      </Button>

      <Modal open={!!removing} onClose={() => setRemoving(null)} title="Remove bank account?">
        <p className="text-sm text-muted">
          {removing ? `${removing.bankName ?? removing.holder} ${maskAccount(removing.number)}` : ""} will no longer be available for withdrawals.
          {removing?.isDefault && bankAccounts.length > 1 ? " Your next account will become the default." : ""}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="ghost" block onClick={() => setRemoving(null)}>
            Cancel
          </Button>
          <Button variant="danger" block onClick={confirmRemove}>
            Remove
          </Button>
        </div>
      </Modal>
    </>
  );
}
