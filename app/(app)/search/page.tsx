"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { PEOPLE, formatEventDate } from "@/lib/data";
import { distanceKm } from "@/lib/geo";
import { useNest } from "@/lib/store";
import type { EventItem, Organization } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EventCard } from "@/components/ui/event-card";
import { Chip } from "@/components/ui/form";
import { IconHeart, IconSearch, IconSettingsSliders, IconStar } from "@/components/ui/icons";
import { Avatar, Badge, EmptyState, PageTitle } from "@/components/ui/primitives";

type Tab = "events" | "organizations" | "users" | "tonight";
const TABS: { value: Tab; label: string }[] = [
  { value: "events", label: "Events" },
  { value: "organizations", label: "Organizations" },
  { value: "users", label: "Users" },
  { value: "tonight", label: "Tonight" },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<PageTitle>Search</PageTitle>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const events = useNest((s) => s.events);
  const organizations = useNest((s) => s.organizations);

  const qParam = params.get("q") ?? "";
  const catParam = (params.get("category") ?? "").toLowerCase();
  const date = params.get("date") ?? "";
  const min = Number(params.get("min") ?? "");
  const max = Number(params.get("max") ?? "");
  const dist = Number(params.get("dist") ?? "");
  const lat = Number(params.get("lat") ?? "");
  const lng = Number(params.get("lng") ?? "");
  const hasPrice = params.has("min") && params.has("max") && !Number.isNaN(min) && !Number.isNaN(max);
  const hasDist = params.has("dist") && !Number.isNaN(dist) && !Number.isNaN(lat) && !Number.isNaN(lng) && params.has("lat");
  const filtered = hasPrice || !!date || hasDist;

  const [q, setQ] = useState(qParam);
  const [tab, setTab] = useState<Tab>(() => (TABS.some((t) => t.value === catParam) ? (catParam as Tab) : "events"));
  // re-sync local state when the URL changes (derive-during-render pattern)
  const [prevQ, setPrevQ] = useState(qParam);
  if (prevQ !== qParam) {
    setPrevQ(qParam);
    setQ(qParam);
  }
  const [prevCat, setPrevCat] = useState(catParam);
  if (prevCat !== catParam) {
    setPrevCat(catParam);
    if (TABS.some((t) => t.value === catParam)) setTab(catParam as Tab);
  }

  const needle = q.trim().toLowerCase();
  const matchEvent = (e: EventItem) =>
    !needle ||
    e.title.toLowerCase().includes(needle) ||
    e.venue.toLowerCase().includes(needle) ||
    e.category.toLowerCase().includes(needle) ||
    (e.location.city ?? "").toLowerCase().includes(needle) ||
    formatEventDate(e).toLowerCase().includes(needle) ||
    e.startDate.includes(needle);

  const live = useMemo(() => events.filter((e) => e.status !== "draft"), [events]);

  const eventResults = live.filter((e) => {
    if (!matchEvent(e)) return false;
    if (hasPrice && (e.price < min || e.price > max)) return false;
    if (date && e.startDate !== date) return false;
    if (hasDist && e.location.lat != null && e.location.lng != null) {
      if (distanceKm({ lat, lng }, { lat: e.location.lat, lng: e.location.lng }) > dist) return false;
    }
    return true;
  });

  const today = new Date().toISOString().slice(0, 10);
  const tonight = useMemo(() => {
    const ok = live.filter(matchEvent);
    const todays = ok.filter((e) => e.startDate === today);
    if (todays.length) return todays;
    const upcoming = ok.filter((e) => e.startDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
    return (upcoming.length ? upcoming : ok).slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, needle, today]);

  const orgResults = organizations.filter(
    (o) => !needle || o.name.toLowerCase().includes(needle) || o.type.toLowerCase().includes(needle) || o.categories.some((c) => c.toLowerCase().includes(needle)),
  );
  const userResults = PEOPLE.filter((p) => !needle || p.name.toLowerCase().includes(needle) || (p.title ?? "").toLowerCase().includes(needle));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.replace(`/search?${next.toString()}`);
  };

  return (
    <div className="flex flex-col gap-7">
      <PageTitle>Search</PageTitle>

      <div className="flex items-center gap-3">
        <form onSubmit={submit} className="flex h-16 flex-1 items-center gap-4 rounded-full bg-surface px-6">
          <IconSearch size={24} className="shrink-0 text-text" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Name, Date"
            className="h-full flex-1 bg-transparent text-[18px] text-text placeholder:text-muted"
            aria-label="Search"
          />
        </form>
        <Link
          href="/search/filter"
          className={cn(
            "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-3",
            filtered && "ring-2 ring-accent",
          )}
          aria-label="Filter"
          title="Filter"
        >
          <IconSettingsSliders size={22} />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-text">Quick filters</p>
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <Chip key={t.value} size="sm" active={tab === t.value} onClick={() => setTab(t.value)}>
              {t.label}
            </Chip>
          ))}
          {filtered && (
            <button
              type="button"
              onClick={() => router.replace(qParam ? `/search?q=${encodeURIComponent(qParam)}` : "/search")}
              className="ml-2 text-xs text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {tab === "events" && (
        <ResultsGrid list={eventResults} empty="No events match your search." />
      )}
      {tab === "tonight" && <ResultsGrid list={tonight} empty="Nothing happening tonight." />}
      {tab === "organizations" &&
        (orgResults.length ? (
          <div className="flex flex-wrap gap-5">
            {orgResults.map((o) => (
              <OrgCard key={o.id} org={o} events={events} />
            ))}
          </div>
        ) : (
          <EmptyState title="No organizations found" sub="Try a different name." />
        ))}
      {tab === "users" &&
        (userResults.length ? (
          <ul className="flex max-w-[520px] flex-col gap-2">
            {userResults.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-[20px] px-2 py-2 transition hover:bg-surface">
                <Link href={`/users/${p.id}`} className="flex flex-1 items-center gap-4">
                  <Avatar src={p.avatar} size={44} />
                  <span className="flex flex-col">
                    <span className="text-[15px] font-semibold text-text">{p.name}</span>
                    <span className="text-[11px] font-medium text-accent">{p.title ?? "People · 4 Mutual Friends"}</span>
                  </span>
                </Link>
                <Link href={`/users/${p.id}`} className="rounded-full bg-surface px-4 py-2 text-[11px] font-semibold text-text transition hover:bg-surface-3">
                  View Profile
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No people found" sub="Try a different name." />
        ))}
    </div>
  );
}

function ResultsGrid({ list, empty }: { list: EventItem[]; empty: string }) {
  if (!list.length) return <EmptyState title={empty} sub="Adjust your search or filters to see more results." />;
  return (
    <div className="flex flex-wrap gap-6">
      {list.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}

function OrgCard({ org, events }: { org: Organization; events: EventItem[] }) {
  const fav = useNest((s) => s.favorites.includes(org.id));
  const toggle = useNest((s) => s.toggleFavorite);
  const tag = events.find((e) => e.organizationId === org.id)?.category ?? org.categories[0] ?? org.type;
  return (
    <Link href={`/organizations/${org.id}`} className="group flex w-[250px] flex-col overflow-hidden rounded-[20px] bg-surface-2 transition hover:-translate-y-0.5">
      <div className="relative h-[110px] w-full">
        <Image src={org.cover ?? "/images/posters/crowd.jpg"} alt="" fill sizes="250px" className="object-cover" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">{tag}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(org.id);
          }}
          className={cn(
            "absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-black/30 backdrop-blur transition",
            fav ? "text-accent" : "text-white hover:text-accent",
          )}
          aria-label="Favorite"
        >
          <IconHeart size={15} filled={fav} />
        </button>
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-3">
        <p className="text-[15px] font-semibold text-text">{org.name}{org.type === "Promoter" ? "" : " Organizer"}</p>
        <p className="text-[10px] text-muted">
          {org.categories[0] ?? org.type} · {org.followers ?? "0"} followers
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Avatar src={org.logo} size={24} />
            <span className="flex flex-col">
              <span className="text-[12px] font-semibold text-text">{org.name}</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-muted">
                <IconStar size={10} className="text-accent" />
                <b className="text-text">{(org.rating ?? 0).toFixed(1)}</b> ({org.ratingCount ?? "0"})
              </span>
            </span>
          </span>
          {org.verified && (
            <Badge color="green" className="h-5 px-2 text-[9px]">
              Verified
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
