"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@/lib/wallet-store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Toggle } from "@/components/ui/form";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { WalletReady } from "../../_components/wallet-ui";

type Errors = Partial<Record<"holder" | "bankName" | "number" | "routing", string>>;

export default function AddBankPage() {
  return (
    <FlowPage title="Back" backHref="/organizer/wallet/bank-accounts" width="sm">
      <div className="flex flex-col gap-7">
        <DisplayTitle>
          Add Bank
          <br />
          Details
        </DisplayTitle>
        <WalletReady>
          <AddBankForm />
        </WalletReady>
      </div>
    </FlowPage>
  );
}

function AddBankForm() {
  const router = useRouter();
  const toast = useToast();
  const hasAccounts = useWallet((s) => s.bankAccounts.length > 0);
  const addBankAccount = useWallet((s) => s.addBankAccount);

  const [holder, setHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [number, setNumber] = useState("");
  const [routing, setRouting] = useState("");
  const [isDefault, setIsDefault] = useState(!hasAccounts);
  const [errors, setErrors] = useState<Errors>({});

  const clear = (k: keyof Errors) => errors[k] && setErrors((e) => ({ ...e, [k]: undefined }));

  const submit = () => {
    const clean = number.replace(/\s+/g, "");
    const e: Errors = {};
    if (!holder.trim()) e.holder = "Enter the account holder name";
    if (!bankName.trim()) e.bankName = "Enter the bank name";
    if (clean.length < 8) e.number = "Enter a valid account number or IBAN";
    else if (!/^[A-Za-z0-9]+$/.test(clean)) e.number = "Only letters and digits are allowed";
    if (!routing.trim()) e.routing = "Enter the routing number or SWIFT code";
    setErrors(e);
    if (Object.keys(e).length) {
      toast("Please complete the highlighted fields", "error");
      return;
    }
    addBankAccount(
      { holder: holder.trim(), bankName: bankName.trim(), number: clean.toUpperCase(), routing: routing.trim().toUpperCase() },
      hasAccounts ? isDefault : true,
    );
    toast("Bank account saved", "success");
    router.push("/organizer/wallet/bank-accounts");
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(ev) => {
        ev.preventDefault();
        submit();
      }}
    >
      <Field label="Account Holder Name" error={errors.holder}>
        <Input
          value={holder}
          onChange={(ev) => {
            setHolder(ev.target.value);
            clear("holder");
          }}
          placeholder="Martin Press"
          autoComplete="name"
          invalid={!!errors.holder}
        />
      </Field>
      <Field label="Bank Name" error={errors.bankName}>
        <Input
          value={bankName}
          onChange={(ev) => {
            setBankName(ev.target.value);
            clear("bankName");
          }}
          placeholder="Chase Bank"
          invalid={!!errors.bankName}
        />
      </Field>
      <Field label="Account Number / IBAN" error={errors.number}>
        <Input
          value={number}
          onChange={(ev) => {
            setNumber(ev.target.value.toUpperCase());
            clear("number");
          }}
          placeholder="MW05015154889189199110"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          invalid={!!errors.number}
        />
      </Field>
      <Field label="Routing / SWIFT" error={errors.routing}>
        <Input
          value={routing}
          onChange={(ev) => {
            setRouting(ev.target.value.toUpperCase());
            clear("routing");
          }}
          placeholder="CHASUS33"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          invalid={!!errors.routing}
        />
      </Field>
      <div className="flex items-center gap-4 rounded-[24px] bg-surface-2 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-text">Set as default</p>
          <p className="text-xs text-dim">
            {hasAccounts ? "Use this account for withdrawals" : "Your first account is always the default"}
          </p>
        </div>
        <Toggle checked={hasAccounts ? isDefault : true} onChange={setIsDefault} disabled={!hasAccounts} label="Set as default" />
      </div>
      <Button type="submit" variant="white" size="lg" block className="mt-2">
        Save
      </Button>
    </form>
  );
}
