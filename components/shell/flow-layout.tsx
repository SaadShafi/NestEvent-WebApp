"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useNest } from "@/lib/store";
import { BackHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Full-bleed dark page with a "Back" header on the left and content column,
 * used for details / wizard / checkout screens (matches Figma "Back" pages).
 */
export function FlowPage({
  title,
  backHref,
  children,
  width = "md",
  className,
  requireAuth = true,
  stacked = false,
  asideClassName,
}: {
  title?: string;
  backHref?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  requireAuth?: boolean;
  /** Back header on its own row and the content centred below it (forms / tickets shown mid-screen). */
  stacked?: boolean;
  /** Overrides the 200px back-header column (e.g. `md:w-auto` for a long title). */
  asideClassName?: string;
}) {
  const router = useRouter();
  const { user, hydrated } = useNest();
  useEffect(() => {
    if (requireAuth && hydrated && !user) router.replace("/auth/role");
  }, [requireAuth, hydrated, user, router]);

  if (requireAuth && (!hydrated || !user)) {
    return <div className="grid min-h-screen place-items-center text-dim">Loading…</div>;
  }
  return (
    <div className="min-h-screen bg-bg px-4 pb-20 pt-6 sm:px-5 md:px-16 md:pb-24 md:pt-12">
      <div className={cn("mx-auto flex max-w-[1400px] flex-col gap-8", !stacked && "md:flex-row md:gap-16")}>
        <div className={cn("shrink-0", !stacked && "md:w-[200px]", asideClassName)}>
          <BackHeader title={title} href={backHref} />
        </div>
        <div
          className={cn(
            "min-w-0 flex-1",
            stacked && "mx-auto w-full md:mt-6",
            width === "sm" && "max-w-[520px]",
            width === "md" && "max-w-[640px]",
            width === "lg" && "max-w-[900px]",
            width === "xl" && "max-w-[1180px]",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
