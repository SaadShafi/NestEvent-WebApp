import Image from "next/image";
import type { ReactNode } from "react";

/** Split auth layout: orange crowd hero on the left, dark form on the right. */
export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/images/auth-hero.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
        <div className="absolute left-16 top-16 max-w-[560px]">
          <p className="font-display text-[150px] font-black leading-[0.85] tracking-tight text-white">NEST</p>
          <p className="mt-8 text-[30px] font-medium leading-snug text-white">
            Discover events. Meet your people.
            <br />
            Make memories
          </p>
        </div>
      </div>
      <div className="relative flex items-center justify-center px-5 py-12 md:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_10%,rgba(255,106,0,0.14),transparent_70%)]" />
        <div className="relative w-full max-w-[520px]">{children}</div>
      </div>
    </div>
  );
}

export function AuthCard({ children, title, sub }: { children: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="relative mb-4 block h-[70px] w-[120px]">
        <Image src="/brand/nest-logo.png" alt="Nest" fill sizes="120px" className="object-contain" priority />
      </span>
      <h1 className="font-display text-[30px] font-extrabold text-text">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      <div className="glow-card mt-6 w-full rounded-[32px] border border-border/60 p-5 md:p-6">{children}</div>
    </div>
  );
}
