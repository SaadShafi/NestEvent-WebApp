"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard, AuthSplit } from "@/components/shell/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, PasswordInput } from "@/components/ui/form";
import { IconAppleLogo, IconGoogleLogo } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useNest } from "@/lib/store";
import { isEmail } from "@/lib/utils";

export default function SignInPage() {
  const router = useRouter();
  const toast = useToast();
  const signIn = useNest((s) => s.signIn);
  const onboarded = useNest((s) => s.onboarded);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const finish = (addr: string) => {
    signIn(addr);
    toast("Welcome back!", "success");
    router.push(onboarded ? "/dashboard" : "/onboarding/profile");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isEmail(email.trim())) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    finish(email.trim());
  };

  const social = (provider: "Apple" | "Google") => {
    toast(`Signed in with ${provider}`, "success");
    finish(provider === "Apple" ? "jon@icloud.com" : "jon@gmail.com");
  };

  return (
    <AuthSplit>
      <AuthCard title="Sign in to your Account" sub="Enter your email and password to log in">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label="Email Address" error={errors.email}>
            <Input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={!!errors.email}
              autoComplete="email"
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <PasswordInput
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!errors.password}
              autoComplete="current-password"
            />
          </Field>

          <div className="flex items-center justify-between">
            <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
            <Link href="/auth/forgot-password" className="text-sm text-muted hover:text-text">
              Forgot Password ?
            </Link>
          </div>

          <Button type="submit" variant="white" block loading={busy} className="mt-1">
            Sign in
          </Button>

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted">Or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="dark" block icon={<IconAppleLogo size={20} />} onClick={() => social("Apple")}>
            Continue with Apple
          </Button>
          <Button type="button" variant="dark" block icon={<IconGoogleLogo size={20} />} onClick={() => social("Google")}>
            Continue with Google
          </Button>

          <p className="mt-2 text-center text-sm text-muted">
            Don&apos;t Have An Account?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-accent hover:underline">
              Sign Up Now
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthSplit>
  );
}
