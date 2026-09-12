"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard, AuthSplit } from "@/components/shell/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput, PhoneInput } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { useNest } from "@/lib/store";
import { isEmail, strongPassword } from "@/lib/utils";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "password" | "confirm", string>>;

export default function SignUpPage() {
  const router = useRouter();
  const toast = useToast();
  const signUp = useNest((s) => s.signUp);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+1");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = "Required";
    if (!lastName.trim()) next.lastName = "Required";
    if (!isEmail(email.trim())) next.email = "Enter a valid email address";
    if (phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number";
    if (!strongPassword(password)) next.password = "Password does not meet the requirements below";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    signUp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: `${dial} ${phone.trim()}`,
    });
    toast("Account created", "success");
    router.push("/onboarding/profile");
  };

  return (
    <AuthSplit>
      <AuthCard title="Sign Up To Create Account" sub="Create An account experience accordingly">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" error={errors.firstName}>
              <Input placeholder="Enter" value={firstName} onChange={(e) => setFirstName(e.target.value)} invalid={!!errors.firstName} autoComplete="given-name" />
            </Field>
            <Field label="Last Name" error={errors.lastName}>
              <Input placeholder="Enter" value={lastName} onChange={(e) => setLastName(e.target.value)} invalid={!!errors.lastName} autoComplete="family-name" />
            </Field>
          </div>
          <Field label="Email Address" error={errors.email}>
            <Input type="email" placeholder="Enter Your Email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!errors.email} autoComplete="email" />
          </Field>
          <Field label="Phone Number" error={errors.phone}>
            <PhoneInput value={phone} onChange={setPhone} dial={dial} onDialChange={setDial} />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={!!errors.password} autoComplete="new-password" />
            <ul className="mt-1 flex flex-col gap-1 text-xs text-dim">
              <li className={password.length >= 12 ? "text-success" : undefined}>• At least 12 characters long but 14 or more is better.</li>
              <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? "text-success" : undefined}>
                • A combination of uppercase letters, lowercase letters, numbers, and symbols.
              </li>
            </ul>
          </Field>
          <Field label="Confirm Password" error={errors.confirm}>
            <PasswordInput placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={!!errors.confirm} autoComplete="new-password" />
          </Field>

          <Button type="submit" variant="white" block loading={busy} className="mt-1">
            Sign Up
          </Button>

          <p className="text-center text-sm text-muted">
            I Already Have An Account?{" "}
            <Link href="/auth/sign-in" className="font-semibold text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthSplit>
  );
}
