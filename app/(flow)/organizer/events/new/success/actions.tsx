"use client";

import { useSearchParams } from "next/navigation";
import { useNest } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function EventSuccessActions() {
  const params = useSearchParams();
  const id = params.get("id");
  const latest = useNest((s) => s.events.find((e) => e.ownerId === "me")?.id);
  const target = id ?? latest;
  return (
    <>
      <Button variant="white" size="lg" href={target ? `/organizer/events/${target}` : "/organizer/events"}>
        View Event
      </Button>
      <Button variant="primary" size="lg" href="/organizer/events">
        Go to My Events
      </Button>
    </>
  );
}
