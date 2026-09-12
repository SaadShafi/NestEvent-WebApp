"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/data";
import { useNest } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconChevronDown, IconMastercard } from "@/components/ui/icons";
import { useDraft, WIZARD } from "../_lib/use-draft";

const DURATIONS = [
  { value: "1", label: "1 Day" },
  { value: "3", label: "3 Days" },
  { value: "7", label: "7 Days" },
];
const STARTS = [
  { value: "now", label: "Immediately" },
  { value: "schedule", label: "Schedule" },
];

export default function BoostPage() {
  const router = useRouter();
  const toast = useToast();
  const { draft, patch, ready } = useDraft();
  const publishDraft = useNest((s) => s.publishDraft);
  const [days, setDays] = useState("3");
  const [budget, setBudget] = useState(150);
  const [start, setStart] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [busy, setBusy] = useState<"boost" | "skip" | null>(null);

  const dailyRate = budget / Number(days);
  const tax = Math.round(budget * 0.0102 * 100) / 100;
  const total = Math.round((budget + tax) * 100) / 100;

  const publish = (boosted: boolean) => {
    if (!draft) return;
    if (boosted) {
      if (budget <= 0) return toast("Enter a budget greater than $0", "error");
      if (start === "schedule" && !scheduleDate) return toast("Pick a start date for the boost", "error");
    }
    setBusy(boosted ? "boost" : "skip");
    patch({ boosted });
    // let the patch land before publishing
    setTimeout(() => {
      const ev = publishDraft("live");
      setBusy(null);
      if (!ev) return toast("Could not publish event", "error");
      toast(boosted ? `Event published and boosted for ${days} day${days === "1" ? "" : "s"}` : "Event published", "success");
      router.push(`${WIZARD.success}?id=${ev.id}`);
    }, 0);
  };

  return (
    <FlowPage title="Back" backHref={WIZARD.review} width="lg">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,420px)] lg:justify-between">
        <div className="flex flex-col gap-6">
          <DisplayTitle sub="Paid event boosting.">Boost Event</DisplayTitle>
          <Field label="Boost Duration">
            <Select value={days} onChange={(e) => setDays(e.target.value)} options={DURATIONS} />
          </Field>
          <Field label="Budget">
            <Input type="number" min={0} step="10" value={budget} onChange={(e) => setBudget(Number(e.target.value))} left={<span>$</span>} />
          </Field>
          <Field label="Start">
            <Select value={start} onChange={(e) => setStart(e.target.value)} options={STARTS} />
          </Field>
          {start === "schedule" && (
            <Field label="Start Date">
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="[color-scheme:dark]" />
            </Field>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-[28px] bg-surface-2 p-5">
          <h3 className="text-[20px] font-semibold text-text">Order Summary</h3>
          <dl className="flex flex-col gap-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Quantity</dt>
              <dd className="text-text">{days} day{days === "1" ? "" : "s"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax fee</dt>
              <dd className="text-text">{money(tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Ticket Price</dt>
              <dd className="text-text">
                {money(budget)} <span className="text-dim">({money(dailyRate)}/day)</span>
              </dd>
            </div>
            <div className="mt-1 flex justify-between text-[20px] font-semibold">
              <dt className="text-text">Total Payment</dt>
              <dd className="text-text">{money(total)}</dd>
            </div>
          </dl>

          <h4 className="mt-2 text-[17px] font-semibold text-text">Payment method</h4>
          <button
            type="button"
            onClick={() => toast("Card management is available from Settings", "info")}
            className="flex h-16 items-center gap-3 rounded-full bg-surface px-4 text-left transition hover:bg-surface-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2a1a0c]">
              <IconMastercard size={26} />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-medium text-text">Debit/Credit Card</span>
              <span className="text-xs tracking-[0.2em] text-muted">•••• •••• •••• 1121</span>
            </span>
            <IconChevronDown size={18} className="text-text" />
          </button>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button variant="white" size="lg" onClick={() => publish(true)} loading={busy === "boost"} disabled={!ready || busy === "skip"}>
              Boost payment
            </Button>
            <Button variant="primary" size="lg" onClick={() => publish(false)} loading={busy === "skip"} disabled={!ready || busy === "boost"}>
              Skip boost
            </Button>
          </div>
        </div>
      </div>
    </FlowPage>
  );
}
