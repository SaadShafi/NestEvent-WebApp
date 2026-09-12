"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { DraftEvent } from "@/lib/store";
import type { EventVisibility } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { IconGlobe, IconKey, IconLock, IconUserLock } from "@/components/ui/icons";
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
  const [value, setValue] = useState<EventVisibility>(draft.visibility ?? "public");

  const next = () => {
    patch({ visibility: value, password: value === "password" ? draft.password : undefined, step: 5 });
    router.push(value === "password" ? WIZARD.password : afterAccessStep(draft));
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((o) => (
          <div key={o.value} className="flex h-[76px] items-center gap-4 rounded-full bg-surface-2 px-3">
            <span className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full bg-[#2a1a0c] text-accent">{o.icon}</span>
            <span className="flex-1 text-[17px] text-text">{o.label}</span>
            <Toggle checked={value === o.value} onChange={(v) => v && setValue(o.value)} label={o.label} className="mr-2" />
          </div>
        ))}
      </div>

      <Button variant="white" size="lg" block onClick={next}>
        Next
      </Button>
    </>
  );
}
