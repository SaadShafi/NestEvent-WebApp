"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { DraftEvent } from "@/lib/store";
import type { EventVisibility } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { IconEye, IconEyeOff, IconGlobe, IconKey, IconLock, IconUserLock } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { afterAccessStep, useDraft, WIZARD } from "../_lib/use-draft";

const OPTIONS: { value: EventVisibility; label: string; icon: ReactNode }[] = [
  { value: "public", label: "Public", icon: <IconGlobe size={26} /> },
  { value: "private", label: "Private", icon: <IconUserLock size={26} /> },
  { value: "invite-only", label: "Invite-Only", icon: <IconLock size={26} /> },
  { value: "password", label: "Password Protected", icon: <IconKey size={26} /> },
];

export default function VisibilityPage() {
  const { draft, patch, ready } = useDraft();
  return (
    <FlowPage title="Back" backHref={WIZARD.attendance} width="sm">
      <div className="flex flex-col gap-6">
        <DisplayTitle sub="Public, Private or Invite-Only visibility.">Event Visibility</DisplayTitle>
        {ready && draft ? <Picker draft={draft} patch={patch} /> : <p className="text-dim">Loading…</p>}
      </div>
    </FlowPage>
  );
}

function Picker({ draft, patch }: { draft: DraftEvent; patch: (p: Partial<DraftEvent>) => void }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<EventVisibility>(draft.visibility ?? "public");
  const [show, setShow] = useState(false);
  const password = draft.password ?? "";

  const editPassword = () => {
    patch({ visibility: "password" });
    router.push(WIZARD.password);
  };

  // Figma: switching Password Protected on expands its card with the password field + Edit;
  // Edit (or tapping the empty field) opens Set Event Password. Remember the choice in the draft.
  const select = (v: EventVisibility) => {
    setValue(v);
    setShow(false);
    patch({ visibility: v });
  };

  const next = () => {
    if (value === "password" && !password) {
      toast("Set a password for a password-protected event", "error");
      editPassword();
      return;
    }
    patch({ visibility: value, password: value === "password" ? password : undefined, step: 5 });
    router.push(afterAccessStep(draft));
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((o) => {
          const expanded = o.value === "password" && value === "password";
          return (
            <div
              key={o.value}
              className={cn(
                "border bg-surface-2 px-3 transition",
                expanded ? "rounded-[28px] border-accent pb-4" : "rounded-full border-transparent",
              )}
            >
              <div className="flex h-[76px] items-center gap-3 sm:gap-4">
                <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#2a1a0c] text-accent sm:h-[58px] sm:w-[58px]">{o.icon}</span>
                <span className="min-w-0 flex-1 text-[16px] text-text sm:text-[17px]">{o.label}</span>
                <Toggle checked={value === o.value} onChange={(v) => select(v ? o.value : "public")} label={o.label} className="mr-2" />
              </div>
              {expanded && (
                <div className="px-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {password ? (
                      <div className="flex h-13 min-w-0 flex-1 items-center rounded-full bg-bg pl-5 pr-3">
                        <span className="min-w-0 flex-1 truncate text-[14px] tracking-wide text-text">{show ? password : "•".repeat(Math.min(password.length, 16))}</span>
                        <button
                          type="button"
                          onClick={() => setShow((v) => !v)}
                          className="grid h-9 w-9 shrink-0 place-items-center text-dim hover:text-text"
                          aria-label={show ? "Hide password" : "Show password"}
                        >
                          {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={editPassword}
                        className="flex h-13 min-w-0 flex-1 items-center rounded-full bg-bg pl-5 pr-3 text-left text-[14px] text-dim transition hover:text-text"
                      >
                        <span className="min-w-0 flex-1 truncate">Set a password</span>
                        <IconEye size={18} className="shrink-0" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={editPassword}
                      className="h-13 shrink-0 rounded-full border border-accent px-5 text-[14px] font-semibold text-accent transition hover:bg-accent/10 sm:px-7"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-3 text-center text-xs text-muted">Share This Password With Your Audience</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="white" size="lg" block onClick={next}>
        Next
      </Button>
    </>
  );
}
