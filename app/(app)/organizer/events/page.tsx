"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useNest } from "@/lib/store";
import type { EventItem } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { PillTabs } from "@/components/ui/form";
import { EmptyState, PageTitle } from "@/components/ui/primitives";

type Tab = "live" | "draft" | "past";

const TABS: { value: Tab; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "past", label: "Past" },
];

const MY_ORG = "org-nightbloom";

function isPast(e: EventItem, today: string) {
  return e.status === "past" || e.endDate < today;
}

export default function MyEventsPage() {
  const router = useRouter();
  const role = useNest((s) => s.role);
  const setRole = useNest((s) => s.setRole);
  const events = useNest((s) => s.events);
  const setDraft = useNest((s) => s.setDraft);
  const [tab, setTab] = useState<Tab>("live");

  const mine = useMemo(() => events.filter((e) => e.ownerId === "me" || e.organizationId === MY_ORG), [events]);
  const today = new Date().toISOString().slice(0, 10);
  const shown = useMemo(() => {
    if (tab === "draft") return mine.filter((e) => e.status === "draft");
    if (tab === "past") return mine.filter((e) => isPast(e, today));
    return mine.filter((e) => e.status === "live" && !isPast(e, today));
  }, [mine, tab, today]);

  const createEvent = () => {
    setDraft({ id: uid("draft"), step: 1 });
    router.push("/organizer/events/new/details");
  };

  return (
    <div className="flex flex-col gap-7">
      <PageTitle>My Events</PageTitle>

      {role !== "organizer" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-accent/40 bg-surface-2 px-6 py-5">
          <div>
            <p className="font-semibold text-text">You are browsing as a guest</p>
            <p className="text-sm text-dim">Switch to the organizer role to create and manage events.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setRole("organizer")}>
            Switch to Organizer
          </Button>
        </div>
      )}

      <PillTabs tabs={TABS} value={tab} onChange={setTab} className="w-full max-w-[790px]" />

      {shown.length === 0 ? (
        <EmptyState
          title={tab === "draft" ? "No drafts yet" : tab === "past" ? "No past events" : "No live events"}
          sub="Create an event and it will show up here once it is saved."
          action={
            <Button variant="primary" onClick={createEvent}>
              Create Event
            </Button>
          }
        />
      ) : (
        <div className="flex flex-wrap gap-4">
          {shown.map((e) => (
            <EventCard key={e.id} event={e} compact href={`/organizer/events/${e.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
