"use client";

import type { ReactNode } from "react";
import { BackHeader } from "@/components/ui/primitives";
import { NestLogo } from "@/components/ui/nest-logo";

/** Figma input style used inside the centred auth card (translucent fill + hairline border). */
export const AUTH_INPUT = "h-11! border-white/20! bg-white/10! text-[12px]! placeholder:text-text/75!";

/**
 * Full-page warm backdrop with "← Back" top-left and the glass form card centred
 * (Forgot Password / OTP Verification / Set New Password — Figma ~518px card). Figma sets these
 * cards in a narrow geometric face (Gilroy-like); Urbanist is the closest font we ship.
 */
export function CenteredAuthCard({
  screen = "Back",
  title,
  sub,
  backHref,
  children,
}: {
  /** Text next to the back arrow. */
  screen?: string;
  title: ReactNode;
  sub?: ReactNode;
  backHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-backdrop auth-backdrop-center relative min-h-screen px-4 py-6 sm:px-8 md:px-16 md:py-10">
      <div className="relative">
        <BackHeader title={screen} href={backHref} />
      </div>
      <div className="relative flex min-h-[calc(100vh-120px)] items-center justify-center py-8">
        <div className="auth-card-glass animate-fade-in w-full font-display max-w-[518px] rounded-[32px] px-5 py-12 sm:px-[45px] sm:pb-[68px] sm:pt-[75px]">
          <div className="flex flex-col items-center text-center">
            <NestLogo priority className="mb-6 h-[70px]" />
            <h1 className="text-[21px] font-semibold leading-tight text-text">{title}</h1>
            {sub && <p className="mt-1.5 text-[12px] text-text/85">{sub}</p>}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
