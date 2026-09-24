"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { LocationValue } from "@/lib/types";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, RangeSlider, Select } from "@/components/ui/form";
import { IconCalendar } from "@/components/ui/icons";
import { LocationInput } from "@/components/ui/location-input";

export default function FilterPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-dim">Loading…</div>}>
      <Filter />
    </Suspense>
  );
}

const num = (v: string | null, fallback: number) => (v != null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : fallback);

function Filter() {
  const router = useRouter();
  // "Edit" on the Filter Result screen comes back here with the current filters in the URL.
  const params = useSearchParams();
  const [category, setCategory] = useState(params.get("category") ?? "events");
  const [location, setLocation] = useState<LocationValue | null>(() => {
    const address = params.get("loc");
    if (!address) return null;
    const lat = params.get("lat");
    const lng = params.get("lng");
    return { address, lat: lat ? Number(lat) : undefined, lng: lng ? Number(lng) : undefined };
  });
  const [date, setDate] = useState(params.get("date") ?? "");
  const [price, setPrice] = useState<[number, number]>([num(params.get("min"), 150), num(params.get("max"), 250)]);
  const [distance, setDistance] = useState<[number, number]>([num(params.get("dmin"), 25), num(params.get("dist"), 40)]);

  const apply = () => {
    const p = new URLSearchParams();
    const q = params.get("q");
    if (q) p.set("q", q);
    p.set("results", "1");
    p.set("category", category);
    const loc = location?.address?.trim() ?? "";
    if (loc) p.set("loc", loc);
    if (date) p.set("date", date);
    p.set("min", String(price[0]));
    p.set("max", String(price[1]));
    p.set("dmin", String(distance[0]));
    p.set("dist", String(distance[1]));
    if (location?.lat != null && location?.lng != null) {
      p.set("lat", String(location.lat));
      p.set("lng", String(location.lng));
    }
    router.push(`/search?${p.toString()}`);
  };

  return (
    <FlowPage title="Filter" backHref="/search" width="sm">
      <div className="flex flex-col gap-6">
        <Field label="Category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "events", label: "Events" },
              { value: "organizations", label: "Organizations" },
              { value: "users", label: "Users" },
            ]}
          />
        </Field>
        <Field label="Location">
          <LocationInput value={location} onChange={setLocation} placeholder="Celina, Delaware" />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Any date"
            className="[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0"
            right={<IconCalendar size={18} className="pointer-events-none" />}
          />
        </Field>
        <Field label="Price Range">
          <RangeSlider min={0} max={500} value={price} onChange={setPrice} rightLabel="Min To Max" format={(n) => `$${n.toFixed(2)}`} />
        </Field>
        <Field label="Distance">
          <RangeSlider min={0} max={500} value={distance} onChange={setDistance} rightLabel="500 KM" format={(n) => `${n} KM`} />
        </Field>
        <Button variant="white" size="lg" block onClick={apply} className="mt-4">
          Apply Filter
        </Button>
      </div>
    </FlowPage>
  );
}
