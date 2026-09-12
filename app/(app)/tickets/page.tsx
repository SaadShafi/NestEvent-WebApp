"use client";

import { useMemo, useState } from "react";
import { useNest } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { PillTabs } from "@/components/ui/form";
import { EmptyState, PageTitle } from "@/components/ui/primitives";

type Tab = "upcoming" | "past";

export default function TicketsPage() {
  const orders = useNest((s) => s.orders);
  const events = useNest((s) => s.events);
  const [tab, setTab] = useState<Tab>("upcoming");

  const today = new Date().toISOString().slice(0, 10);
  const rows = useMemo(
    () =>
      orders
        .map((o) => ({ order: o, event: events.find((e) => e.id === o.eventId) }))
        .filter((r): r is { order: (typeof orders)[number]; event: NonNullable<(typeof events)[number]> } => !!r.event),
    [orders, events],
  );
  const upcoming = rows.filter((r) => r.event.startDate >= today);
  const past = rows.filter((r) => r.event.startDate < today);
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="flex flex-col gap-7">
      <PageTitle>My Tickets</PageTitle>
      <PillTabs<Tab>
        className="max-w-[560px]"
        tabs={[
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {rows.length === 0 ? (
        <EmptyState
          title="You have no tickets yet"
          sub="Find an event you love and grab your ticket. Your orders will show up here."
          action={<Button href="/dashboard">Explore events</Button>}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "upcoming" ? "No upcoming tickets" : "No past tickets"}
          sub={tab === "upcoming" ? "Tickets for events that haven't happened yet will appear here." : "Events you have already attended will appear here."}
          action={<Button href="/dashboard">Explore events</Button>}
        />
      ) : (
        <div className="flex flex-wrap gap-6">
          {list.map((r) => (
            <EventCard key={r.order.id} event={r.event} href={`/tickets/${r.order.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
