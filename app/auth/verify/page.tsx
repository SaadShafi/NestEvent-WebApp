"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CenteredAuthCard } from "../_components/centered-card";

const RESEND_SECONDS = 48;

function VerifyForm() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string>();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const setAt = (i: number, v: string) => {
    setDigits((d) => {
      const n = [...d];
      n[i] = v;
      return n;
    });
  };

  const onChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "");
    if (!v) {
      setAt(i, "");
      return;
    }
    if (v.length > 1) {
      // typed/pasted several digits into one box
      const next = [...digits];
      v.split("").slice(0, 4 - i).forEach((ch, k) => (next[i + k] = ch));
      setDigits(next);
      refs.current[Math.min(3, i + v.length)]?.focus();
      return;
    }
    setAt(i, v);
    setError(undefined);
    if (i < 3) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setAt(i - 1, "");
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 3) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", ""];
    text.split("").forEach((ch, k) => (next[k] = ch));
    setDigits(next);
    refs.current[Math.min(3, text.length)]?.focus();
  };

  const resend = () => {
    setSeconds(RESEND_SECONDS);
    setDigits(["", "", "", ""]);
    refs.current[0]?.focus();
    toast(email ? `New code sent to ${email}` : "New code sent", "success");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (digits.some((d) => !d)) {
      setError("Enter the 4-digit code");
      return;
    }
    toast("Code verified", "success");
    router.push("/auth/reset-password");
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <CenteredAuthCard title="OTP Verification" sub="Please enter 4 digit code we have sent you on your Email" backHref="/auth/forgot-password">
      <form onSubmit={submit} className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={4}
              aria-label={`Digit ${i + 1}`}
              autoFocus={i === 0}
              className={cn(
                "h-13 w-13 rounded-[14px] border bg-surface text-center text-lg font-semibold text-text outline-none transition focus:border-accent",
                d ? "border-border-soft" : "border-transparent",
                error && "border-danger/60",
              )}
            />
          ))}
        </div>
        {error && <p className="-mt-3 text-xs text-danger">{error}</p>}

        {seconds > 0 ? (
          <span className="inline-flex h-10 items-center rounded-full bg-surface px-5 text-xs text-muted">
            Resend in {mm}:{ss}
          </span>
        ) : (
          <button type="button" onClick={resend} className="inline-flex h-10 items-center rounded-full bg-surface px-5 text-xs font-semibold text-accent transition hover:bg-surface-3">
            Resend
          </button>
        )}

        <Button type="submit" variant="white" block className="mt-4">
          Continue
        </Button>
      </form>
    </CenteredAuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-bg text-dim">Loading…</div>}>
      <VerifyForm />
    </Suspense>
  );
}
