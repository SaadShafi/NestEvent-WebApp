import Image from "next/image";
import type { ReactNode } from "react";

/** Full-screen "Successfully" page with the dark textured background + NEST logo. */
export function SuccessScreen({ title, sub, actions }: { title: ReactNode; sub?: string; actions: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6">
      <Image src="/images/success-bg.png" alt="" fill className="object-cover opacity-90" priority />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(255,106,0,0.14),rgba(13,13,13,0.2)_70%)]" />
      <div className="relative flex max-w-[520px] flex-col items-center text-center">
        <span className="relative mb-6 block h-[80px] w-[130px]">
          <Image src="/brand/nest-logo.png" alt="Nest" fill sizes="130px" className="object-contain" />
        </span>
        <h1 className="font-display text-[44px] font-extrabold leading-[1.05] text-text md:text-[52px]">{title}</h1>
        {sub && <p className="mt-4 text-[17px] text-muted">{sub}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
