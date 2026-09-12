"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { DraftEvent } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { IconCheckCircle, IconRsvp, IconTicketedEvent } from "@/components/ui/icons";
import { useDraft, WIZARD } from "../_lib/use-draft";

type Model = "ticketed" | "rsvp";

const OPTIONS: { value: Model; title: string; sub: string; icon: ReactNode }[] = [
  {
    value: "ticketed",
    title: "Ticketed Event",
    sub: "Sell paid ticket types with quantities, order limits and access restrictions.",
    icon: <IconTicketedEvent size={44} />,
  },
  {
    value: "rsvp",
    title: "RSVP Event",
    sub: "Free entry with a guest list, capacity and contact capture for your attendees.",
    icon: <IconRsvp size={44} className="text-accent" />,
  },
];

export default function AttendancePage() {
  const { draft, patch, ready } = useDraft();
  return (
    <FlowPage title="Attendance Model" backHref={WIZARD.eventDetails} width="sm">
      <div className="flex flex-col gap-6">
        <DisplayTitle sub="Choose Ticketed or RSVP">
          Attendance
          <br />
          Model
        </DisplayTitle>
        {ready && draft ? <Picker draft={draft} patch={patch} /> : <p className="text-dim">Loading…</p>}
      </div>
    </FlowPage>
  );
}

function Picker({ draft, patch }: { draft: DraftEvent; patch: (p: Partial<DraftEvent>) => void }) {
  const router = useRouter();
  const [model, setModel] = useState<Model>(draft.attendance ?? "ticketed");

  return (
    <>
      <div className="flex flex-col gap-4">
        {OPTIONS.map((o) => {
          const active = model === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setModel(o.value)}
              className={cn(
                "relative flex flex-col items-start gap-4 rounded-[28px] border bg-surface-2 p-6 text-left transition",
                active ? "border-accent" : "border-transparent hover:border-border-soft",
              )}
            >
              {active && <IconCheckCircle size={26} className="absolute right-5 top-5 text-success" />}
              {o.icon}
              <span className="flex flex-col gap-1.5">
                <span className="text-[20px] font-semibold text-text">{o.title}</span>
                <span className="text-sm text-muted">{o.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <Button
        variant="white"
        size="lg"
        block
        onClick={() => {
          patch({ attendance: model, step: 4 });
          router.push(WIZARD.visibility);
        }}
      >
        Next
      </Button>
    </>
  );
}
