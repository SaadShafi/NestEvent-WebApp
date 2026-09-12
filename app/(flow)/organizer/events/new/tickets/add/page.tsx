"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { TicketType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { IconClock } from "@/components/ui/icons";
import { readTicketStash, useDraft, WIZARD, writeTicketStash, type TicketStash } from "../../_lib/use-draft";

const EMPTY: TicketStash = { name: "", price: 35, quantity: 100, startTime: "22:00", endTime: "04:00", minPerOrder: 1, maxPerOrder: 4 };

const toStash = (t: TicketType): TicketStash => ({
  id: t.id,
  name: t.name,
  price: t.price,
  quantity: t.quantity,
  startTime: t.startTime ?? "22:00",
  endTime: t.endTime ?? "04:00",
  minPerOrder: t.minPerOrder,
  maxPerOrder: t.maxPerOrder,
});

export default function AddTicketTypePage() {
  return (
    <Suspense fallback={null}>
      <AddTicketType />
    </Suspense>
  );
}

function AddTicketType() {
  const params = useSearchParams();
  const editId = params.get("edit");
  const { draft, ready } = useDraft();

  // Prefill from a stash left by the restrictions step, else from the ticket being edited.
  const initial = useMemo<TicketStash | null>(() => {
    if (!ready) return null;
    const stash = readTicketStash();
    if (stash && (!editId || stash.id === editId)) return stash;
    const existing = editId ? draft?.ticketTypes?.find((x) => x.id === editId) : undefined;
    return existing ? toStash(existing) : { ...EMPTY, id: editId ?? undefined };
  }, [ready, editId, draft?.ticketTypes]);

  return (
    <FlowPage title="Back" backHref={WIZARD.tickets} width="sm">
      <div className="flex flex-col gap-6">
        <DisplayTitle>
          {editId ? "Edit Ticket" : "Add Ticket"}
          <br />
          Type
        </DisplayTitle>
        {initial ? <TicketForm key={editId ?? "new"} initial={initial} editId={editId} /> : <p className="text-dim">Loading…</p>}
      </div>
    </FlowPage>
  );
}

function TicketForm({ initial, editId }: { initial: TicketStash; editId: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<TicketStash>(initial);
  const [error, setError] = useState("");
  const set = <K extends keyof TicketStash>(k: K, v: TicketStash[K]) => setForm((f) => ({ ...f, [k]: v }));
  const nameMissing = !form.name.trim();

  const submit = () => {
    if (nameMissing) return setError("Ticket name is required");
    if (form.quantity < 1) return setError("Quantity must be at least 1");
    if (form.maxPerOrder < form.minPerOrder) return setError("Maximum per order must be at least the minimum");
    setError("");
    const stash: TicketStash = { ...form, id: editId ?? form.id, name: form.name.trim() };
    writeTicketStash(stash);
    router.push(stash.id ? `${WIZARD.ticketsRestrictions}?edit=${stash.id}` : WIZARD.ticketsRestrictions);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label="Ticket Name" error={error && nameMissing ? error : undefined}>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="General" invalid={!!error && nameMissing} />
      </Field>
      <Field label="Price">
        <Input type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", Number(e.target.value))} left={<span>$</span>} />
      </Field>
      <Field label="Quantity Available">
        <Input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} placeholder="1,000" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Time">
          <Input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="[color-scheme:dark]" right={<IconClock size={18} />} />
        </Field>
        <Field label="End Time">
          <Input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className="[color-scheme:dark]" right={<IconClock size={18} />} />
        </Field>
      </div>
      <Field label="Minimum Per Order">
        <Input type="number" min={1} value={form.minPerOrder} onChange={(e) => set("minPerOrder", Number(e.target.value))} />
      </Field>
      <Field label="Maximum Per Order" error={error && !nameMissing ? error : undefined}>
        <Input type="number" min={1} value={form.maxPerOrder} onChange={(e) => set("maxPerOrder", Number(e.target.value))} />
      </Field>

      <Button type="submit" variant="white" size="lg" block className="mt-2">
        Save & Continue
      </Button>
    </form>
  );
}
