"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { DraftEvent } from "@/lib/store";
import type { TicketType } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconClock } from "@/components/ui/icons";
import { readTicketStash, useDraft, WIZARD, writeTicketStash, type TicketStash } from "../../_lib/use-draft";

const AGES = [
  { value: "None", label: "None" },
  { value: "18+", label: "18+" },
  { value: "21+", label: "21+" },
];
const AREAS = ["General", "VIP", "Backstage", "Custom"].map((a) => ({ value: a, label: a }));

export default function TicketRestrictionsPage() {
  return (
    <Suspense fallback={null}>
      <TicketRestrictions />
    </Suspense>
  );
}

function TicketRestrictions() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const { draft, patch, ready } = useDraft();

  const existing = useMemo(() => (editId ? draft?.ticketTypes?.find((t) => t.id === editId) : undefined), [editId, draft?.ticketTypes]);
  const stash = useMemo<TicketStash | null>(() => {
    if (!ready) return null;
    const s = readTicketStash();
    if (s) return s;
    if (existing) {
      return {
        id: existing.id,
        name: existing.name,
        price: existing.price,
        quantity: existing.quantity,
        startTime: existing.startTime ?? "22:00",
        endTime: existing.endTime ?? "04:00",
        minPerOrder: existing.minPerOrder,
        maxPerOrder: existing.maxPerOrder,
      };
    }
    return null;
  }, [ready, existing]);

  // Nothing to configure: send the organizer back to the basics step.
  useEffect(() => {
    if (ready && !stash) router.replace(WIZARD.ticketsAdd);
  }, [ready, stash, router]);

  return (
    <FlowPage title="Back" backHref={editId ? `${WIZARD.ticketsAdd}?edit=${editId}` : WIZARD.ticketsAdd} width="sm">
      <div className="flex flex-col gap-6">
        <DisplayTitle>
          Ticket Access
          <br />
          Restrictions
        </DisplayTitle>
        {stash && draft ? (
          <RestrictionsForm key={stash.id ?? "new"} stash={stash} existing={existing} draft={draft} patch={patch} editId={editId} />
        ) : (
          <p className="text-dim">Loading…</p>
        )}
      </div>
    </FlowPage>
  );
}

function RestrictionsForm({
  stash,
  existing,
  draft,
  patch,
  editId,
}: {
  stash: TicketStash;
  existing?: TicketType;
  draft: DraftEvent;
  patch: (p: Partial<DraftEvent>) => void;
  editId: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [age, setAge] = useState(existing?.ageRestriction ?? "None");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [area, setArea] = useState(existing?.accessArea ?? "General");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [startTime, setStartTime] = useState(stash.startTime);
  const [endTime, setEndTime] = useState(stash.endTime);
  const [minPerOrder, setMin] = useState(stash.minPerOrder);
  const [maxPerOrder, setMax] = useState(stash.maxPerOrder);

  const save = () => {
    if (maxPerOrder < minPerOrder) return toast("Maximum per order must be at least the minimum", "error");
    const ticket: TicketType = {
      id: stash.id ?? editId ?? uid("tt"),
      name: stash.name,
      price: stash.price,
      quantity: stash.quantity,
      startTime,
      endTime,
      minPerOrder,
      maxPerOrder,
      ageRestriction: age === "None" ? undefined : age,
      description: description.trim() || undefined,
      accessArea: area,
      notes: notes.trim() || undefined,
    };
    const list = draft.ticketTypes ?? [];
    const exists = list.some((t) => t.id === ticket.id);
    patch({ ticketTypes: exists ? list.map((t) => (t.id === ticket.id ? ticket : t)) : [...list, ticket] });
    writeTicketStash(null);
    toast(exists ? "Ticket type updated" : "Ticket type added", "success");
    router.push(WIZARD.tickets);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <p className="-mt-2 text-sm text-dim">
        Configuring access for <span className="font-medium text-text">{stash.name}</span>
      </p>

      <Field label="Age Restriction">
        <Select value={age} onChange={(e) => setAge(e.target.value)} options={AGES} />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} max={200} placeholder="Brand Bio And Purpose" />
      </Field>
      <Field label="Access Area">
        <Select value={area} onChange={(e) => setArea(e.target.value)} options={AREAS} />
      </Field>
      <Field label="Notes Shown At Checkout">
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Valid ID Required" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Time">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="[color-scheme:dark]" right={<IconClock size={18} />} />
        </Field>
        <Field label="End Time">
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="[color-scheme:dark]" right={<IconClock size={18} />} />
        </Field>
      </div>
      <Field label="Minimum Per Order">
        <Input type="number" min={1} value={minPerOrder} onChange={(e) => setMin(Number(e.target.value))} />
      </Field>
      <Field label="Maximum Per Order">
        <Input type="number" min={1} value={maxPerOrder} onChange={(e) => setMax(Number(e.target.value))} />
      </Field>

      <Button type="submit" variant="white" size="lg" block className="mt-2">
        Save Ticket Type
      </Button>
    </form>
  );
}
