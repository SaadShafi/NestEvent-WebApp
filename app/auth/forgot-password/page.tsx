"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, PhoneInput } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { CenteredAuthCard } from "../_components/centered-card";

/** Forgot Password (Figma): the reset code is sent to the registered phone number. */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [dial, setDial] = useState("+1");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!digits) return setError("Phone number is required");
    if (digits.length < 7 || digits.length > 15) return setError("Enter a valid phone number");
    setError(undefined);
    const full = `${dial} ${phone.trim()}`;
    toast(`Verification code sent to ${full}`, "success");
    router.push(`/auth/verify?phone=${encodeURIComponent(full)}`);
  };

  return (
    <CenteredAuthCard
      title="In order to reset your password"
      sub="You need to enter your registered phone number"
      backHref="/auth/sign-in"
    >
      <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
        <Field label="Phone Number" error={error}>
          <PhoneInput
            value={phone}
            onChange={(v) => {
              setPhone(v);
              if (error) setError(undefined);
            }}
            dial={dial}
            onDialChange={setDial}
            className="h-11! border-white/20! bg-white/10!"
          />
        </Field>
        <Button type="submit" variant="white" block className="h-11! text-[13px]!">
          Continue
        </Button>
      </form>
    </CenteredAuthCard>
  );
}
