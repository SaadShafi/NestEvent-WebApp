import Image from "next/image";
import type { ReactNode } from "react";
import { NestLogo } from "@/components/ui/nest-logo";

/**
 * Split auth layout: orange crowd hero on the left, warm-glow backdrop with the
 * black form card on the right. The hero is pinned to the viewport height so it
 * is the same size on every auth screen, however tall the form is.
 */
export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="auth-backdrop grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden h-screen overflow-hidden lg:sticky lg:top-0 lg:block">
        <Image src="/images/auth-hero.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
        <div className="absolute left-12 top-12 max-w-[560px] xl:left-16 xl:top-16">
          <p className="font-display text-[110px] font-black leading-[0.85] tracking-tight text-white xl:text-[150px]">NEST</p>
          <p className="mt-8 text-[24px] font-medium leading-snug text-white xl:text-[30px]">
            Discover events. Meet your people.
            <br />
            Make memories
          </p>
        </div>
      </div>
      <div className="relative flex min-w-0 items-center justify-center px-4 py-10 sm:px-8 md:px-12 md:py-12">
        <div className="relative w-full max-w-[520px]">{children}</div>
      </div>
    </div>
  );
}

export function AuthCard({ children, title, sub }: { children: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center">
      <NestLogo priority className="mb-5 h-16 md:h-20" />
      <h1 className="text-center font-display text-[26px] font-extrabold text-text sm:text-[30px]">{title}</h1>
      {sub && <p className="mt-1 text-center text-sm text-muted">{sub}</p>}
      <div className="auth-card mt-6 w-full rounded-[32px] p-5 md:p-6">{children}</div>
    </div>
  );
}
