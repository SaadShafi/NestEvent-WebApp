"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EVENT_CATEGORIES, TOP_ORGANIZERS } from "@/lib/data";
import { useNest } from "@/lib/store";
import { EventCard } from "@/components/ui/event-card";
import { Chip } from "@/components/ui/form";
import { EmptyState, PageTitle } from "@/components/ui/primitives";
import { IconPin } from "@/components/ui/icons";
import { OrganizerDashboard } from "./_components/organizer-dashboard";

export default function DashboardPage() {
  const role = useNest((s) => s.role);
  return role === "organizer" ? <OrganizerDashboard /> : <GuestDashboard />;
}

function GuestDashboard() {
  const events = useNest((s) => s.events);
  const currentLocation = useNest((s) => s.currentLocation);
  const [cat, setCat] = useState("All");

  const live = useMemo(() => events.filter((e) => e.status === "live"), [events]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    live.forEach((e) => counts.set(e.category, (counts.get(e.category) ?? 0) + 1));
    // keep the canonical order from EVENT_CATEGORIES, then anything custom
    const ordered = [...EVENT_CATEGORIES.filter((c) => counts.has(c)), ...[...counts.keys()].filter((c) => !EVENT_CATEGORIES.includes(c))];
    return ordered.map((c) => ({ name: c, count: counts.get(c) ?? 0 }));
  }, [live]);

  const shown = cat === "All" ? live : live.filter((e) => e.category === cat);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Dashboard</PageTitle>
        {currentLocation && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-xs text-muted">
            <IconPin size={14} className="text-accent" />
            {currentLocation}
          </span>
        )}
      </div>

      {/* Top organizers */}
      <section className="flex flex-col gap-5">
        <h2 className="text-[20px] font-semibold text-text">Top Organizer Event</h2>
        <div className="-mx-1 flex gap-7 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
          {TOP_ORGANIZERS.map((o) => (
            <Link key={o.id} href={`/organizations/${o.id}`} className="group flex w-[100px] shrink-0 flex-col items-center gap-3">
              <span className="relative grid h-[90px] w-[90px] place-items-center rounded-full bg-white ring-[3px] ring-[#4a1a1a] ring-offset-[3px] ring-offset-bg transition group-hover:ring-accent">
                <span className="relative h-[54px] w-[54px]">
                  <Image src={o.logo} alt={o.name} fill sizes="54px" className="object-contain" />
                </span>
              </span>
              <span className="line-clamp-1 text-center text-[15px] text-text">{o.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore */}
      <section className="flex flex-col gap-5">
        <h2 className="text-[20px] font-semibold text-text">Explore Event</h2>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <Chip size="lg" active={cat === "All"} onClick={() => setCat("All")}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip key={c.name} size="lg" active={cat === c.name} onClick={() => setCat(c.name)}>
              {c.name} <span className={cat === c.name ? "text-white/80" : "text-dim"}>({c.count})</span>
            </Chip>
          ))}
        </div>
        {shown.length ? (
          <div className="flex flex-wrap gap-6">
            {shown.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="No events in this category yet" sub="Try another category or check back soon." />
        )}
      </section>
    </div>
  );
}
