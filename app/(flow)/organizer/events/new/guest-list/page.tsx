"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DraftEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDraft, WIZARD } from "../_lib/use-draft";

const ENABLED = [
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];
const ELIGIBILITY = [
  { value: "Complete Public Profile + Profile Picture", label: "Complete Public Profile + Profile Picture" },
  { value: "Anyone", label: "Anyone" },
];
const CAPTURE = [
  { value: "Email + Phone", label: "Email + Phone" },
  { value: "Email only", label: "Email only" },
];
const CONSENT = [
  { value: "Explicit Opt-In Required", label: "Explicit Opt-In Required" },
  { value: "Implied", label: "Implied" },
];

export default function GuestListPage() {
  const { draft, patch, ready } = useDraft();
  const backHref = draft?.attendance === "rsvp" ? (draft.visibility === "password" ? WIZARD.password : WIZARD.visibility) : WIZARD.tickets;
  return (
    <FlowPage title="Back" backHref={backHref} width="sm">
      {ready && draft ? <Form draft={draft} patch={patch} /> : <p className="text-dim">Loading…</p>}
    </FlowPage>
  );
}

function Form({ draft, patch }: { draft: DraftEvent; patch: (p: Partial<DraftEvent>) => void }) {
  const router = useRouter();
  const toast = useToast();
  const g = draft.guestList;
  const [enabled, setEnabled] = useState(g ? (g.enabled ? "enabled" : "disabled") : "enabled");
  const [capacity, setCapacity] = useState(g?.capacity ?? 75);
  const [eligibility, setEligibility] = useState(g?.eligibility ?? ELIGIBILITY[0].value);
  const [capture, setCapture] = useState(g?.contactCapture ?? CAPTURE[0].value);
  const [consent, setConsent] = useState(g?.marketingConsent ?? CONSENT[0].value);

  const persist = () =>
    patch({
      guestList: { enabled: enabled === "enabled", capacity: Math.max(0, capacity), eligibility, contactCapture: capture, marketingConsent: consent },
      step: 7,
    });

  return (
    <div className="flex flex-col gap-6">
      <DisplayTitle>
        Guest List
        <br />
        Setup
      </DisplayTitle>

      <Field label="Guest List">
        <Select value={enabled} onChange={(e) => setEnabled(e.target.value)} options={ENABLED} />
      </Field>
      <Field label="Guest List Capacity">
        <Input type="number" min={0} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} disabled={enabled === "disabled"} />
      </Field>

      <Field label="Eligibility">
        <Select value={eligibility} onChange={(e) => setEligibility(e.target.value)} options={ELIGIBILITY} />
      </Field>
      <Field label="RSVP Contact Capture">
        <Select value={capture} onChange={(e) => setCapture(e.target.value)} options={CAPTURE} />
      </Field>
      <Field label="Marketing Consent">
        <Select value={consent} onChange={(e) => setConsent(e.target.value)} options={CONSENT} />
      </Field>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="white"
          size="lg"
          onClick={() => {
            persist();
            toast("Waitlist configured", "success");
          }}
        >
          Configure waitlist
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            persist();
            router.push(WIZARD.review);
          }}
        >
          Continue to review
        </Button>
      </div>
    </div>
  );
}
