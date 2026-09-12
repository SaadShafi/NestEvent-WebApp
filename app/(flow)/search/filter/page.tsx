"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LocationValue } from "@/lib/types";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, RangeSlider, Select } from "@/components/ui/form";
import { IconCalendar } from "@/components/ui/icons";
import { LocationInput } from "@/components/ui/location-input";

export default function FilterPage() {
  const router = useRouter();
  const [category, setCategory] = useState("events");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [date, setDate] = useState("");
  const [price, setPrice] = useState<[number, number]>([150, 250]);
  const [distance, setDistance] = useState<[number, number]>([25, 40]);

  const apply = () => {
    const p = new URLSearchParams();
    p.set("category", category);
    const q = location?.city ?? location?.address ?? "";
    if (q) p.set("q", q);
    if (date) p.set("date", date);
    p.set("min", String(price[0]));
    p.set("max", String(price[1]));
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
