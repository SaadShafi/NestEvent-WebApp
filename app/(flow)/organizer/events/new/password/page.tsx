"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DraftEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDraft, WIZARD } from "../_lib/use-draft";

export default function EventPasswordPage() {
  const { draft, patch, ready } = useDraft();
  return (
    <FlowPage title="Back" backHref={WIZARD.visibility} width="md">
      <div className="flex flex-col gap-8">
        <DisplayTitle>Set Event Password</DisplayTitle>
        {ready && draft ? <PasswordForm draft={draft} patch={patch} /> : <p className="text-dim">Loading…</p>}
      </div>
    </FlowPage>
  );
}

function PasswordForm({ draft, patch }: { draft: DraftEvent; patch: (p: Partial<DraftEvent>) => void }) {
  const router = useRouter();
  const toast = useToast();
  // Editing an existing password starts from it.
  const [password, setPassword] = useState(draft.password ?? "");
  const [confirm, setConfirm] = useState(draft.password ?? "");
  const [error, setError] = useState("");

  const save = () => {
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    patch({ visibility: "password", password, step: 5 });
    toast("Event password saved", "success");
    // Back to Event Visibility, where the password can be viewed / edited before continuing.
    router.push(WIZARD.visibility);
  };

  return (
    <form
      className="mx-auto flex w-full max-w-[300px] flex-col items-center gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <span className="grid h-[96px] w-[96px] place-items-center rounded-full bg-[#2a1a0c]">
        <span className="flex flex-col items-center font-display text-[26px] font-extrabold leading-none tracking-[0.2em] text-accent">
          ***
          <span className="mt-1 block h-[3px] w-12 rounded-full bg-accent" />
        </span>
      </span>
      <div className="text-center">
        <h2 className="font-display text-[22px] font-bold text-text">Set a Password</h2>
        <p className="mt-1 text-xs text-muted">
          Create a password to control
          <br />
          Access to your event
        </p>
      </div>

      <Field label="Password" className="w-full">
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" invalid={!!error} />
      </Field>
      <Field label="Confirm Password" className="w-full" error={error}>
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" invalid={!!error} />
      </Field>

      <ul className="w-full list-disc space-y-1.5 pl-5 text-[11px] text-muted">
        <li>At least 12 characters long but 14 or more is better.</li>
        <li>A combination of uppercase letters, lowercase letters, numbers, and symbols.</li>
      </ul>

      <Button type="submit" variant="white" block className="mt-3">
        Save Password
      </Button>
    </form>
  );
}
