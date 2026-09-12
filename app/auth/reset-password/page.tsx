"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { strongPassword } from "@/lib/utils";
import { CenteredAuthCard } from "../_components/centered-card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!strongPassword(password)) next.password = "Password does not meet the requirements below";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;
    toast("Password updated. Please sign in.", "success");
    router.push("/auth/sign-in");
  };

  const mixOk = /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);

  return (
    <CenteredAuthCard title="Set New Password" sub="Please enter your new password" backHref="/auth/verify">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field error={errors.password}>
          <PasswordInput placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} autoComplete="new-password" autoFocus />
        </Field>
        <Field error={errors.confirm}>
          <PasswordInput placeholder="Confirm New Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={!!errors.confirm} autoComplete="new-password" />
        </Field>
        <ul className="flex flex-col items-center gap-1 text-center text-[11px] text-dim">
          <li className={password.length >= 12 ? "text-success" : undefined}>• At least 12 characters long but 14 or more is better.</li>
          <li className={mixOk ? "text-success" : undefined}>• A combination of uppercase letters, lowercase letters, numbers, and symbols.</li>
        </ul>
        <Button type="submit" variant="white" block className="mt-2">
          Continue
        </Button>
      </form>
    </CenteredAuthCard>
  );
}
