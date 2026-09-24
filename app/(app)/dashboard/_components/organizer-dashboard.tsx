"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { compact } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { EventItem, Organization, TeamMember } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { Select } from "@/components/ui/form";
import { Avatar, EmptyState, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  IconAnalytics,
  IconChevronRight,
  IconClock,
  IconEdit,
  IconEye,
  IconLink,
  IconMail,
  IconPhone,
  IconPlus,
  IconPromo,
  IconStar,
  IconTrash,
} from "@/components/ui/icons";
import { BarChart } from "./charts";
import { IconDollar, IconFlash, IconSpark, IconTrendUp, IconWallet } from "./dashboard-icons";
import { compactMoney, conversionRate, eventStats, hash, isMyEvent, isMyOrg, sumStats } from "./org-stats";

type Tab = "events" | "organizations" | "team" | "analytics" | "marketing";

const TABS: { value: Tab; label: string }[] = [
  { value: "events", label: "Events" },
  { value: "organizations", label: "Organizations" },
  { value: "team", label: "Team" },
  { value: "analytics", label: "Analytics" },
  { value: "marketing", label: "Marketing Hub" },
];

const FALLBACK_COVER = "/images/posters/crowd.jpg";

/** Small orange glyph above a stat value (StatsRow.StatIcon in the mobile app). */
function StatIcon({ children, circle }: { children: ReactNode; circle?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-8 w-8 place-items-center text-accent",
        circle ? "rounded-full border-[1.5px] border-accent bg-black/20" : "rounded-[8px] bg-accent/15",
      )}
    >
      {children}
    </span>
  );
}

function StatTile({ icon, value, label, glass }: { icon: ReactNode; value: string; label: string; glass?: boolean }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-[20px] p-3 sm:p-4",
        glass ? "border border-white/15 bg-black/35 backdrop-blur" : "bg-surface",
      )}
    >
      <span className="mb-2">{icon}</span>
      <span className="truncate text-[18px] font-semibold text-text sm:text-[24px]">{value}</span>
      <span className="truncate text-xs text-muted sm:text-sm">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

/** Figma stat tile: dark bordered card, orange-outlined icon circle, value + label. */
function HeaderStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-[20px] border border-white/20 bg-gradient-to-b from-[#1c1c1c] to-[#101010] p-3 sm:rounded-[24px] sm:px-5 sm:pb-4 sm:pt-4">
      <span className="grid h-8 w-8 place-items-center rounded-full border border-accent/70 bg-black/30 text-accent sm:h-9 sm:w-9">{icon}</span>
      <span className="mt-3 truncate text-[18px] font-bold leading-none text-text sm:mt-4 sm:text-[24px]">{value}</span>
      <span className="mt-1.5 truncate text-[11px] text-text/90 sm:mt-2 sm:text-sm">{label}</span>
    </div>
  );
}

/** Figma: "Dashboard" + subtitle + tabs on the left, Events / Tickets Sold / Earnings tiles on the right. */
function DashboardHeader({ events, tabs }: { events: EventItem[]; tabs: ReactNode }) {
  const orders = useNest((s) => s.orders);
  const totals = useMemo(() => sumStats(events.map((e) => eventStats(e, orders))), [events, orders]);

  return (
    <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
      <div className="flex min-w-0 flex-col">
        <h1 className="text-[26px] font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-[15px] text-text/90">Monitor Complaints and Search for User Issues</p>
        <div className="mt-6 xl:mt-12">{tabs}</div>
      </div>
      <div className="grid w-full grid-cols-3 gap-2.5 sm:gap-4 xl:w-auto xl:grid-cols-[repeat(3,150px)]">
        <HeaderStat value={compact(events.length)} label="Events" icon={<IconStar size={17} />} />
        <HeaderStat value={compact(totals.sold)} label="Tickets Sold" icon={<IconStar size={17} />} />
        <Link href="/organizer/wallet" className="min-w-0 rounded-[24px] transition hover:brightness-110" aria-label="Earnings — open wallet">
          <HeaderStat value={compactMoney(totals.revenue)} label="Earnings" icon={<IconDollar size={17} />} />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Organizations                                                       */
/* ------------------------------------------------------------------ */

function OrganizationTile({ org }: { org: Organization }) {
  const cover = org.cover ?? FALLBACK_COVER;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] bg-surface-2 transition hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] w-full bg-surface-3">
        <Image src={cover} alt="" fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" unoptimized={cover.startsWith("/uploads")} />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white">{org.type}</span>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <Link href={`/organizations/${org.id}`} className="line-clamp-1 text-[17px] font-semibold text-text after:absolute after:inset-0">
          {org.name} Organizer
        </Link>
        <span className="text-xs text-dim">
          {org.categories[0] ?? org.type} · {org.followers ?? "0"} followers
        </span>
        <div className="mt-2 flex items-center gap-2.5">
          <Avatar src={org.logo} alt={org.name} size={30} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-text">{org.name}</span>
            <span className="inline-flex items-center gap-1 text-xs">
              <IconStar size={12} className="text-accent" />
              <span className="font-medium text-accent">{(org.rating ?? 0).toFixed(1)}</span>
              <span className="text-dim">({org.ratingCount ?? "0"})</span>
            </span>
          </div>
        </div>
      </div>
      {/* Sits above the stretched name link */}
      <Link
        href={`/organizer/organization/${org.id}/details`}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#0d0d0d] transition hover:bg-[#e9e9e9]"
      >
        <IconEdit size={12} />
        Edit
      </Link>
    </div>
  );
}

function CreateOrganizationTile() {
  return (
    <Link
      href="/organizer/organization/new"
      className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[28px] border-[1.5px] border-dashed border-accent p-6 text-center transition hover:bg-accent/5"
    >
      <span className="mb-1 grid h-13 w-13 place-items-center rounded-full bg-accent/15 text-accent">
        <IconPlus size={24} />
      </span>
      <span className="text-[17px] font-semibold text-text">Create Organization</span>
      <span className="max-w-[240px] text-xs text-dim">Add a new promoter, venue or collective profile</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

function TeamCard({ member, orgName, editHref, onDelete }: { member: TeamMember; orgName: string; editHref: string; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-surface-2 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar src={member.avatar} alt={member.name} size={48} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[16px] font-semibold text-text">{member.name}</span>
          <span className="truncate text-xs text-muted">
            {member.role} · {orgName}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href={editHref} className="inline-flex items-center gap-1.5 text-sm text-text hover:underline">
            <IconEdit size={14} />
            Edit
          </Link>
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline">
            <IconTrash size={14} />
            Delete
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text">
        <span className="inline-flex min-w-0 items-center gap-2">
          <IconPhone size={15} className="shrink-0 text-accent" />
          <span className="truncate">{member.phone}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-2">
          <IconMail size={15} className="shrink-0 text-accent" />
          <span className="truncate">{member.email}</span>
        </span>
      </div>
    </div>
  );
}

function TeamTab({ orgs }: { orgs: Organization[] }) {
  const toast = useToast();
  const updateOrganization = useNest((s) => s.updateOrganization);
  const [pending, setPending] = useState<{ member: TeamMember; org: Organization } | null>(null);

  const members = orgs.flatMap((org) => (org.team ?? []).map((member) => ({ member, org })));
  const addHref = orgs[0] ? `/organizer/organization/${orgs[0].id}/team` : "/organizer/organization/new";

  return (
    <div className="flex flex-col gap-4">
      {members.length === 0 ? (
        <EmptyState title="No team members" sub="Add door managers and event managers to help run your events." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {members.map(({ member, org }) => (
            <TeamCard
              key={`${org.id}-${member.id}`}
              member={member}
              orgName={org.name}
              editHref={`/organizer/organization/${org.id}/team`}
              onDelete={() => setPending({ member, org })}
            />
          ))}
        </div>
      )}
      <Button href={addHref} variant="outline" className="self-start border-accent text-accent hover:bg-accent/10" icon={<IconPlus size={18} />}>
        Add team member
      </Button>

      <Modal open={!!pending} onClose={() => setPending(null)} title="Remove team member">
        <p className="text-sm text-muted">
          Remove <span className="font-semibold text-text">{pending?.member.name}</span> from your team? They will lose access to your events.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={<IconTrash size={16} />}
            onClick={() => {
              if (!pending) return;
              updateOrganization(pending.org.id, { team: (pending.org.team ?? []).filter((m) => m.id !== pending.member.id) });
              setPending(null);
              toast("Team member removed", "success");
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

const WEEK = [
  { label: "Mon", share: 0.62 },
  { label: "Tue", share: 0.48 },
  { label: "Wed", share: 0.55 },
  { label: "Thu", share: 0.3 },
  { label: "Fri", share: 1 },
  { label: "Sat", share: 0.46 },
  { label: "Sun", share: 0.7 },
];

function AnalyticsTab({ events }: { events: EventItem[] }) {
  const orders = useNest((s) => s.orders);
  const [eventId, setEventId] = useState("");
  const selected = events.find((e) => e.id === eventId);

  const stats = useMemo(() => {
    const source = selected ? [selected] : events;
    const list = source.map((e) => ({ e, s: eventStats(e, orders) }));
    const totals = sumStats(list.map((x) => x.s));
    // promo codes aren't stored on the web yet: a stable 8–17% share of each event's revenue
    const promo = list.reduce((n, x) => n + x.s.revenue * (0.08 + (hash(x.e.id) % 10) / 100), 0);
    return { ...totals, promo };
  }, [selected, events, orders]);

  const week = useMemo(() => {
    const seed = hash(selected?.id ?? "all-events");
    const perDay = stats.visits / 7;
    return WEEK.map((d, i) => {
      const value = Math.round(perDay * d.share * (0.8 + ((seed >> i) % 30) / 100) * 1.4);
      return { label: d.label, value, tooltip: compact(value) };
    });
  }, [selected, stats.visits]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:max-w-[420px]">
        <span className="text-sm font-medium text-text">Individual Event Analytics</span>
        <Select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          options={[{ value: "", label: "All events" }, ...events.map((e) => ({ value: e.id, label: e.title }))]}
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <StatTile
          value={compactMoney(stats.revenue)}
          label="Revenue"
          icon={
            <StatIcon>
              <IconWallet size={16} />
            </StatIcon>
          }
        />
        <StatTile
          value={compact(stats.visits)}
          label="Views"
          icon={
            <StatIcon>
              <IconEye size={16} />
            </StatIcon>
          }
        />
        <StatTile
          value={conversionRate(stats.sold, stats.visits)}
          label="Conversion"
          icon={
            <StatIcon>
              <IconTrendUp size={16} />
            </StatIcon>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-dim">Page visits this week</span>
          <BarChart data={week} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
          <div className="flex min-h-[156px] flex-col justify-between rounded-[24px] bg-accent p-4 sm:p-5">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#ffd4b8] text-black">
              <IconClock size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Sales Over Time</p>
              <p className="truncate text-[24px] font-semibold text-white sm:text-[28px]">{compactMoney(stats.revenue)}</p>
            </div>
          </div>
          <div className="flex min-h-[156px] flex-col justify-between rounded-[24px] bg-surface p-4 sm:p-5">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#d9d9d9] text-black">
              <IconSpark size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Promo Performance</p>
              <p className="truncate text-[24px] font-semibold text-text sm:text-[28px]">{compactMoney(stats.promo)}</p>
            </div>
          </div>
        </div>
      </div>

      {selected ? (
        <Button variant="white" href={`/organizer/events/${selected.id}/analytics`} className="w-full sm:w-auto sm:self-start" icon={<IconAnalytics size={18} />}>
          View full analytics
        </Button>
      ) : (
        <p className="text-sm text-dim">Select an event above to open its full analytics.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marketing hub                                                       */
/* ------------------------------------------------------------------ */

type MarketingKey = "promo" | "links" | "sms" | "boost";

const MARKETING: { key: MarketingKey; title: string; caption: string; icon: ReactNode }[] = [
  { key: "promo", title: "Promo codes", caption: "Discount Campaigns", icon: <IconPromo size={22} /> },
  { key: "links", title: "Tracking links", caption: "Promotional Attribution", icon: <IconLink size={22} /> },
  { key: "sms", title: "SMS blast", caption: "Past Attendee Messaging", icon: <IconMail size={22} /> },
  { key: "boost", title: "Event boost", caption: "Paid Discovery Priority", icon: <IconFlash size={22} /> },
];

function MarketingHubTab({ events }: { events: EventItem[] }) {
  const toast = useToast();
  const [picker, setPicker] = useState<MarketingKey | null>(null);
  const live = events.filter((e) => e.status !== "draft");

  const open = (key: MarketingKey) => {
    if (key === "sms") return toast("SMS blasts are available in the NEST mobile app", "info");
    if (key === "boost") return toast("Boost an event from the Boost step when creating it, or in the NEST mobile app", "info");
    if (!live.length) return toast("Publish an event first to manage its promo codes and links", "info");
    setPicker(key);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {MARKETING.map((it) => (
          <button
            key={it.key}
            type="button"
            onClick={() => open(it.key)}
            className="flex h-[170px] flex-col justify-between rounded-[24px] bg-surface-2 p-4 text-left transition hover:bg-surface-3 sm:p-5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-white">{it.icon}</span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[17px] font-semibold text-text sm:text-[19px]">{it.title}</span>
              <span className="text-xs text-dim">{it.caption}</span>
            </span>
          </button>
        ))}
      </div>

      <Modal
        open={!!picker}
        onClose={() => setPicker(null)}
        title={picker === "promo" ? "Promo codes" : "Tracking links"}
      >
        <p className="mb-4 text-sm text-muted">
          Choose an event. {picker === "promo" ? "Promo codes" : "Tracking links"} are managed from the event&apos;s page.
        </p>
        <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {live.map((e) => (
            <Link
              key={e.id}
              href={`/organizer/events/${e.id}`}
              className="flex items-center gap-3 rounded-[18px] bg-surface px-3 py-3 transition hover:bg-surface-3"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-surface-3">
                <Image src={e.cover} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{e.title}</span>
              <IconChevronRight size={18} className="shrink-0 text-dim" />
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

/** Organizer Home (Figma): Dashboard title + stat tiles, then Events / Organizations / Team / Analytics / Marketing Hub. */
export function OrganizerDashboard() {
  const router = useRouter();
  const allEvents = useNest((s) => s.events);
  const allOrgs = useNest((s) => s.organizations);
  const setDraft = useNest((s) => s.setDraft);
  const [tab, setTab] = useState<Tab>("events");

  const events = useMemo(() => allEvents.filter(isMyEvent), [allEvents]);
  const orgs = useMemo(() => allOrgs.filter(isMyOrg), [allOrgs]);

  const createEvent = () => {
    setDraft({ id: uid("draft"), step: 1 });
    router.push("/organizer/events/new/details");
  };

  const tabs = (
    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
      <div className="flex w-max gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "h-10 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition",
              tab === t.value ? "bg-accent text-white" : "bg-surface text-text hover:bg-surface-3",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader events={events} tabs={tabs} />

      {tab === "events" &&
        (events.length === 0 ? (
          <EmptyState
            title="No events yet"
            sub="Create your first event and it will show up here."
            action={
              <Button variant="primary" onClick={createEvent}>
                Create Event
              </Button>
            }
          />
        ) : (
          <div className="flex flex-wrap justify-center gap-5 sm:justify-start">
            {events.map((e) => (
              <EventCard key={e.id} event={e} href={`/organizer/events/${e.id}`} />
            ))}
          </div>
        ))}

      {tab === "organizations" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orgs.map((o) => (
            <OrganizationTile key={o.id} org={o} />
          ))}
          <CreateOrganizationTile />
        </div>
      )}

      {tab === "team" && <TeamTab orgs={orgs} />}
      {tab === "analytics" && <AnalyticsTab events={events} />}
      {tab === "marketing" && <MarketingHubTab events={events} />}
    </div>
  );
}
