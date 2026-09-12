"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DraftEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDraft, WIZARD } from "../_lib/use-draft";

export default function EventDetailsPage() {
  const { draft, patch, ready } = useDraft();
  return (
    <FlowPage title="Back" backHref={WIZARD.details} width="sm">
      {ready && draft ? <Form draft={draft} patch={patch} /> : <p className="text-dim">Loading…</p>}
    </FlowPage>
  );
}

function Form({ draft, patch }: { draft: DraftEvent; patch: (p: Partial<DraftEvent>) => void }) {
  const router = useRouter();
  const toast = useToast();
  const [description, setDescription] = useState(draft.description ?? "");
  const [faqs, setFaqs] = useState(draft.faqs ?? "");
  const [rules, setRules] = useState(draft.rules ?? "");
  const [dressCode, setDressCode] = useState(draft.dressCode ?? "");
  const [parking, setParking] = useState(draft.parking ?? "");
  const [error, setError] = useState("");

  const next = () => {
    if (!description.trim()) {
      setError("Add a short description so guests know what to expect");
      toast("Description is required", "error");
      return;
    }
    patch({ description: description.trim(), faqs: faqs.trim(), rules: rules.trim(), dressCode: dressCode.trim(), parking: parking.trim(), step: 3 });
    router.push(WIZARD.attendance);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <DisplayTitle sub="Description and practical attendee information.">Event Details</DisplayTitle>
      <Field label="Description" error={error}>
        <Textarea value={description} onChange={(e) => { setDescription(e.target.value); setError(""); }} max={1000} placeholder="What makes this event special?" />
      </Field>
      <Field label="FAQs">
        <Textarea value={faqs} onChange={(e) => setFaqs(e.target.value)} max={1000} placeholder="Common attendee questions answered" />
      </Field>
      <Field label="Rules">
        <Textarea value={rules} onChange={(e) => setRules(e.target.value)} max={1000} placeholder="Age, entry and conduct rules" />
      </Field>
      <Field label="Dress Code">
        <Input value={dressCode} onChange={(e) => setDressCode(e.target.value)} placeholder="Smart Nightlife Attire" />
      </Field>
      <Field label="Parking / Transport">
        <Textarea value={parking} onChange={(e) => setParking(e.target.value)} max={1000} placeholder="Valet, rideshare and garage info" />
      </Field>
      <Button type="submit" variant="white" block className="mt-2">
        Next
      </Button>
    </form>
  );
}
