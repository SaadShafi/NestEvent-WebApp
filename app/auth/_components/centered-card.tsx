"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BackHeader } from "@/components/ui/primitives";

/** Full-page dark background with "← Back" top-left and a glowing card centered (Forgot / OTP / Reset screens). */
export function CenteredAuthCard({
  title,
  sub,
  backHref,
  children,
}: {
  title: string;
  sub?: string;
  backHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-bg px-5 py-8 md:px-16 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(255,106,0,0.12),transparent_70%)]" />
      <div className="relative">
        <BackHeader title="Back" href={backHref} />
      </div>
      <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center">
        <div className="glow-card animate-fade-in w-full max-w-[440px] rounded-[32px] border border-border/60 px-8 py-12 md:px-9">
          <div className="flex flex-col items-center text-center">
            <span className="relative mb-6 block h-[64px] w-[110px]">
              <Image src="/brand/nest-logo.png" alt="Nest" fill sizes="110px" className="object-contain" priority />
            </span>
            <h1 className="text-[22px] font-semibold text-text">{title}</h1>
            {sub && <p className="mt-1.5 text-[13px] text-muted">{sub}</p>}
          </div>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
