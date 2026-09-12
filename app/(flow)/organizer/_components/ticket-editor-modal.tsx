"use client";

import { useState } from "react";
import type { TicketType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Modal } from "@/components/ui/primitives";

const AGES = [
  { value: "None", label: "None" },
  { value: "18+", label: "18+" },
  { value: "21+", label: "21+" },
];

/** Inline editor for an existing ticket type (used on the View Event page). */
export function TicketEditorModal({
  ticket,
  onClose,
  onSave,
}: {
  ticket: TicketType | null;
  onClose: () => void;
  onSave: (t: TicketType) => void;
}) {
  return (
    <Modal open={!!ticket} onClose={onClose} title="Edit Ticket Type">
      {ticket && <EditorForm key={ticket.id} initial={ticket} onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

function EditorForm({ initial, onClose, onSave }: { initial: TicketType; onClose: () => void; onSave: (t: TicketType) => void }) {
  const [form, setForm] = useState<TicketType>(initial);
  const set = <K extends keyof TicketType>(k: K, v: TicketType[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSave(form);
      }}
    >
      <Field label="Ticket Name">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="General" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price">
          <Input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
        </Field>
        <Field label="Quantity Available">
          <Input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Minimum Per Order">
          <Input type="number" min={1} value={form.minPerOrder} onChange={(e) => set("minPerOrder", Number(e.target.value))} />
        </Field>
        <Field label="Maximum Per Order">
          <Input type="number" min={1} value={form.maxPerOrder} onChange={(e) => set("maxPerOrder", Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Age Restriction">
        <Select options={AGES} value={form.ageRestriction ?? "None"} onChange={(e) => set("ageRestriction", e.target.value)} />
      </Field>
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="white">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
