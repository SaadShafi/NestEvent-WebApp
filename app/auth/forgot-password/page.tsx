"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { isEmail } from "@/lib/utils";
import { CenteredAuthCard } from "../_components/centered-card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!isEmail(v)) {
      setError("Enter a valid email address");
      return;
    }
    setError(undefined);
    toast(`Verification code sent to ${v}`, "success");
    router.push(`/auth/verify?email=${encodeURIComponent(v)}`);
  };

  return (
    <CenteredAuthCard title="Forgot Password" sub="Enter your email and we'll send you a 4-digit code" backHref="/auth/sign-in">
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <Field error={error}>
          <Input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={!!error}
            autoComplete="email"
            autoFocus
          />
        </Field>
        <Button type="submit" variant="white" block>
          Continue
        </Button>
      </form>
    </CenteredAuthCard>
  );
}
