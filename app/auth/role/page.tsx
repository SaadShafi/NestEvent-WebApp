"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthSplit } from "@/components/shell/auth-layout";
import { NestLogo } from "@/components/ui/nest-logo";
import { IconCheckCircle } from "@/components/ui/icons";
import { useNest } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { value: Role; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "guest",
    title: "I'm Here To Explore Event",
    desc: "Discover nightlife, festivals and shows near you and grab tickets in seconds.",
    icon: <Image src="/icons/role-explore.svg" alt="" width={40} height={40} className="h-10 w-10" />,
  },
  {
    value: "organizer",
    title: "I'm An Organizer",
    desc: "Create events, manage teams and sell tickets to your community.",
    icon: <Image src="/icons/role-organizer.svg" alt="" width={40} height={40} className="h-10 w-10" />,
  },
];

export default function RolePage() {
  const router = useRouter();
  const storedRole = useNest((s) => s.role);
  const user = useNest((s) => s.user);
  const hydrated = useNest((s) => s.hydrated);
  const setRole = useNest((s) => s.setRole);
  const [role, setLocal] = useState<Role>("guest");

  useEffect(() => {
    // Sync the selection from the persisted store once it has hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated) setLocal(storedRole);
  }, [hydrated, storedRole]);

  const start = () => {
    setRole(role);
    router.push(user ? "/dashboard" : "/auth/sign-in");
  };

  return (
    <AuthSplit>
      <div className="flex flex-col items-center">
        <NestLogo priority className="mb-5 h-16 md:h-20" />
        <h1 className="text-center font-display text-[30px] font-extrabold text-text sm:text-[34px]">Select Your Role</h1>
        <p className="mt-2 text-center text-[15px] text-muted">Choose how you&apos;d like to use Nest</p>

        <div className="mt-10 flex w-full flex-col gap-5">
          {ROLES.map((r) => {
            const active = r.value === role;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setLocal(r.value)}
                aria-pressed={active}
                className={cn(
                  "relative w-full rounded-[24px] border bg-[#0b0b0b] px-5 py-5 text-left transition sm:px-6 sm:py-6",
                  active ? "border-accent shadow-[0_0_0_1px_rgba(255,106,0,0.4)]" : "border-border-soft hover:border-border",
                )}
              >
                {active && (
                  <span className="absolute right-5 top-5 text-[#7be495]">
                    <IconCheckCircle size={22} />
                  </span>
                )}
                <span className="text-accent">{r.icon}</span>
                <p className="mt-4 text-[17px] font-semibold text-text">{r.title}</p>
                <p className="mt-1.5 max-w-[300px] text-xs leading-relaxed text-dim">{r.desc}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={start}
          className="mt-8 h-13 w-full rounded-full border border-border bg-[#0b0b0b] text-[15px] font-semibold text-text transition hover:bg-surface-3"
        >
          Get Started
        </button>
      </div>
    </AuthSplit>
  );
}
