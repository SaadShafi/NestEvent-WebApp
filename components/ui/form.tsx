"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { IconCheck, IconChevronDown, IconClose, IconEye, IconEyeOff } from "./icons";

export function Field({
  label,
  hint,
  error,
  children,
  className,
  action,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || action) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-[13px] font-medium text-text">{label}</label>}
          {action}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-dim">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-full bg-surface px-5 text-[14px] text-text placeholder:text-dim border border-transparent focus:border-border-soft transition disabled:opacity-60";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  left?: ReactNode;
  right?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, left, right, invalid, ...rest },
  ref,
) {
  return (
    <div className="relative flex items-center">
      {left && <span className="pointer-events-none absolute left-5 text-dim">{left}</span>}
      <input
        ref={ref}
        className={cn(inputBase, "h-13", left && "pl-12", right && "pr-12", invalid && "border-danger/60", className)}
        {...rest}
      />
      {right && (
        <span
          className={cn(
            "absolute right-4 flex items-center text-dim",
            (rest.type === "date" || rest.type === "time" || rest.type === "datetime-local") && "pointer-events-none",
          )}
        >
          {right}
        </span>
      )}
    </div>
  );
});

export function PasswordInput(props: InputProps) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      right={
        <button type="button" onClick={() => setShow((s) => !s)} className="text-dim hover:text-text" aria-label="Toggle password">
          {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      }
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  max?: number;
}

export function Textarea({ className, max, value, ...rest }: TextareaProps) {
  const len = typeof value === "string" ? value.length : 0;
  return (
    <div className="relative">
      <textarea
        value={value}
        maxLength={max}
        className={cn(
          "min-h-[130px] w-full resize-none rounded-[24px] bg-surface px-5 py-4 text-[14px] text-text placeholder:text-dim border border-transparent focus:border-border-soft transition",
          max && "pb-8",
          className,
        )}
        {...rest}
      />
      {max && (
        <span className="pointer-events-none absolute bottom-3 right-5 text-xs text-dim">
          {len} / {max}
        </span>
      )}
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ className, options, placeholder, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(inputBase, "h-13 appearance-none pr-12 cursor-pointer", className)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-text">
            {o.label}
          </option>
        ))}
      </select>
      <IconChevronDown size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-text" />
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer select-none items-center gap-2.5 text-sm", className)}>
      <input id={id} type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-[6px] border transition",
          checked ? "border-accent bg-accent text-white" : "border-dim bg-transparent",
        )}
      >
        {checked && <IconCheck size={13} />}
      </span>
      {label && <span className="text-muted">{label}</span>}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  className,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50",
        checked ? "bg-accent" : "bg-[#3a3a3a]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all",
          checked ? "left-7" : "left-1",
        )}
      />
    </button>
  );
}

export function Chip({
  active,
  onClick,
  children,
  removable,
  className,
  size = "md",
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  removable?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition whitespace-nowrap",
        size === "sm" && "h-8 px-4 text-xs",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-13 px-7 text-[15px]",
        active ? "bg-accent text-white" : "bg-surface text-muted hover:bg-surface-3",
        className,
      )}
    >
      {children}
      {active && removable && <IconClose size={14} />}
    </button>
  );
}

export function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  size = "lg",
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "flex-1 rounded-full font-display font-semibold transition",
              size === "lg" ? "h-14 text-[22px]" : "h-11 text-base",
              active ? "bg-accent-gradient text-white shadow-[0_10px_30px_rgba(255,106,0,0.25)]" : "text-text hover:bg-surface",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Counter({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex h-12 items-center gap-3 rounded-full bg-[#0d0d0d] px-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-7 w-7 place-items-center text-lg text-text hover:text-accent"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-semibold text-accent">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid h-7 w-7 place-items-center text-lg text-text hover:text-accent"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

const COUNTRIES = [
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "CA", dial: "+1", flag: "🇨🇦" },
  { code: "PK", dial: "+92", flag: "🇵🇰" },
  { code: "IN", dial: "+91", flag: "🇮🇳" },
  { code: "AE", dial: "+971", flag: "🇦🇪" },
  { code: "DE", dial: "+49", flag: "🇩🇪" },
  { code: "FR", dial: "+33", flag: "🇫🇷" },
  { code: "AU", dial: "+61", flag: "🇦🇺" },
];

export function PhoneInput({
  value,
  onChange,
  dial,
  onDialChange,
  placeholder = "Phone Number",
}: {
  value: string;
  onChange: (v: string) => void;
  dial: string;
  onDialChange: (v: string) => void;
  placeholder?: string;
}) {
  const c = COUNTRIES.find((x) => x.dial === dial) ?? COUNTRIES[0];
  return (
    <div className="flex h-13 items-center rounded-full bg-surface pl-3 pr-5">
      <div className="relative flex items-center gap-1">
        <span className="text-xl">{c.flag}</span>
        <IconChevronDown size={14} className="text-muted" />
        <select
          aria-label="Country code"
          className="absolute inset-0 cursor-pointer opacity-0"
          value={c.code}
          onChange={(e) => {
            const nc = COUNTRIES.find((x) => x.code === e.target.value)!;
            onDialChange(nc.dial);
          }}
        >
          {COUNTRIES.map((x) => (
            <option key={x.code} value={x.code}>
              {x.flag} {x.code} {x.dial}
            </option>
          ))}
        </select>
      </div>
      <span className="ml-2 text-sm text-text">{c.dial}</span>
      <span className="mx-3 h-6 w-px bg-border-soft" />
      <input
        type="tel"
        inputMode="tel"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s-]/g, ""))}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent text-sm text-text placeholder:text-dim"
      />
    </div>
  );
}

export function RangeSlider({
  min,
  max,
  value,
  onChange,
  format = (n) => String(n),
  rightLabel,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (n: number) => string;
  rightLabel?: string;
}) {
  const [lo, hi] = value;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      {rightLabel && <div className="text-right text-sm text-text">{rightLabel}</div>}
      <div className="relative py-2">
        <div className="range-track">
          <div className="range-fill" style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
        </div>
        <input
          type="range"
          className="range-input"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 1), hi])}
          aria-label="Minimum"
        />
        <input
          type="range"
          className="range-input"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 1)])}
          aria-label="Maximum"
        />
      </div>
      <div className="relative h-5 text-xs text-text">
        <span className="absolute -translate-x-1/2" style={{ left: `${pct(lo)}%` }}>
          {format(lo)}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: `${pct(hi)}%` }}>
          {format(hi)}
        </span>
      </div>
    </div>
  );
}
