"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconClose, IconStar } from "./icons";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-[28px] bg-surface-2", className)}>{children}</div>;
}

export function Avatar({
  src,
  alt = "",
  size = 40,
  className,
  ring,
}: {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-full bg-surface-3",
        ring && "ring-2 ring-[#0d0d0d]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" unoptimized={src.startsWith("blob:") || src.startsWith("/uploads")} />
      ) : (
        <span className="grid h-full w-full place-items-center text-xs text-dim">{alt.slice(0, 1)}</span>
      )}
    </span>
  );
}

export function AvatarGroup({ srcs, size = 30, max = 5 }: { srcs: string[]; size?: number; max?: number }) {
  return (
    <div className="flex items-center">
      {srcs.slice(0, max).map((s, i) => (
        <Avatar key={i} src={s} size={size} ring className={cn(i > 0 && "-ml-2.5")} />
      ))}
    </div>
  );
}

export function Rating({ value, count, className }: { value: number; count?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <IconStar size={16} className="text-accent" />
      <span className="font-semibold text-text">{value.toFixed(1)}</span>
      {count && <span className="text-dim">({count})</span>}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} size={14} className={i <= Math.round(value) ? "text-accent" : "text-[#3a3a3a]"} />
      ))}
      <span className="ml-1 text-sm text-muted">{value.toFixed(1)}</span>
    </span>
  );
}

export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn("text-[26px] font-semibold text-text", className)}>{children}</h1>;
}

export function DisplayTitle({ children, className, sub }: { children: ReactNode; className?: string; sub?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h1 className="font-display text-[44px] font-extrabold leading-[1.05] tracking-tight text-text md:text-[56px]">{children}</h1>
      {sub && <p className="text-[17px] text-muted">{sub}</p>}
    </div>
  );
}

export function BackHeader({ title, href, className }: { title?: string; href?: string; className?: string }) {
  const router = useRouter();
  const inner = (
    <>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-text transition group-hover:bg-surface-3">
        <IconArrowLeft size={18} />
      </span>
      <span className="whitespace-nowrap text-xl font-semibold text-text">{title ?? "Back"}</span>
    </>
  );
  return href ? (
    <Link href={href} className={cn("group inline-flex items-center gap-4", className)}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={() => router.back()} className={cn("group inline-flex items-center gap-4", className)}>
      {inner}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={cn("animate-fade-in relative w-full max-w-[520px] rounded-[30px] bg-[#0d0d0d] p-6 shadow-2xl", className)}>
        {(title || !hideClose) && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-text">{title}</h2>
            {!hideClose && (
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#0d0d0d]" aria-label="Close">
                <IconClose size={16} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent", className)} />;
}

export function Badge({ children, color = "orange", className }: { children: ReactNode; color?: "orange" | "green" | "dark"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-medium",
        color === "orange" && "bg-accent text-white",
        color === "green" && "bg-[#1f3d25] text-[#7be495]",
        color === "dark" && "bg-black/60 text-text backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[28px] bg-surface-2 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-text">{title}</p>
      {sub && <p className="max-w-sm text-sm text-dim">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
