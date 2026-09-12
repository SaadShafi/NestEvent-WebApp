"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "white" | "ghost" | "outline" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent-gradient text-white shadow-[0_8px_24px_rgba(255,106,0,0.25)] hover:brightness-110",
  white: "bg-[#fcfcfc] text-[#0d0d0d] hover:bg-white",
  ghost: "bg-surface text-text hover:bg-surface-3",
  outline: "border border-white/70 text-text hover:bg-white/5",
  danger: "bg-[#2a1616] text-danger hover:bg-[#361a1a]",
  dark: "bg-[#141414] border border-border text-text hover:bg-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-13 px-7 text-[15px]",
  lg: "h-16 px-8 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  loading?: boolean;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  loading,
  icon,
  block,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    block && "w-full",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-3",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
