import type { EventItem, Order, Organization } from "@/lib/types";

/** The demo organizer's own organization (see app/(app)/organizer/events/page.tsx). */
export const MY_ORG = "org-nightbloom";

export const isMyEvent = (e: EventItem) => e.ownerId === "me" || e.organizationId === MY_ORG;
export const isMyOrg = (o: Organization) => o.id === MY_ORG || o.ownerId === "me";

/** Stable hash so the demo numbers never jump between renders / reloads. */
export function hash(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Same formula as view-event.tsx so page visits match across screens. */
export function fakeVisits(id: string) {
  return 1200 + (hash(id) % 8000);
}

export interface TicketTypeStat {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

export interface EventStats {
  revenue: number;
  sold: number;
  visits: number;
  byType: TicketTypeStat[];
  /** true when the numbers come from real orders in the store (not demo fallback) */
  real: boolean;
}

/**
 * Revenue / tickets / visits for one event. Real orders win; events without any
 * orders get a deterministic demo split across their ticket types so the analytics
 * screens are never empty. Drafts always report zero.
 */
export function eventStats(event: EventItem, orders: Order[]): EventStats {
  const mine = orders.filter((o) => o.eventId === event.id);
  if (mine.length) {
    const map = new Map<string, TicketTypeStat>();
    for (const o of mine) {
      for (const t of o.tickets) {
        const cur = map.get(t.ticketTypeId) ?? { id: t.ticketTypeId, name: t.ticketTypeName, sold: 0, revenue: 0 };
        cur.sold += t.qty;
        cur.revenue += t.qty * t.unitPrice;
        map.set(t.ticketTypeId, cur);
      }
    }
    const byType = [...map.values()].sort((a, b) => b.revenue - a.revenue || b.sold - a.sold);
    const sold = byType.reduce((a, t) => a + t.sold, 0);
    const revenue = mine.reduce((a, o) => a + o.total, 0);
    return { revenue, sold, visits: Math.max(fakeVisits(event.id), sold * 3), byType, real: true };
  }

  if (event.status === "draft") {
    return {
      revenue: 0,
      sold: 0,
      visits: 0,
      byType: event.ticketTypes.map((t) => ({ id: t.id, name: t.name, sold: 0, revenue: 0 })),
      real: false,
    };
  }

  const h = hash(event.id);
  const types = event.ticketTypes.length
    ? event.ticketTypes
    : [{ id: "tt-general", name: "General", price: event.price, quantity: 400 }];
  const byType = types
    .map((t, i) => {
      // 15%–55% of each type's capacity, different per type
      const frac = 0.15 + (((h >> (i * 3)) % 40) / 100);
      const sold = Math.round(Math.min(t.quantity || 200, 1500) * frac);
      return { id: t.id, name: t.name, sold, revenue: sold * t.price };
    })
    .sort((a, b) => b.revenue - a.revenue || b.sold - a.sold);
  const sold = byType.reduce((a, t) => a + t.sold, 0);
  const revenue = byType.reduce((a, t) => a + t.revenue, 0);
  return { revenue, sold, visits: Math.max(fakeVisits(event.id), sold * 3), byType, real: false };
}

export function sumStats(list: EventStats[]) {
  return list.reduce(
    (t, s) => ({ revenue: t.revenue + s.revenue, sold: t.sold + s.sold, visits: t.visits + s.visits }),
    { revenue: 0, sold: 0, visits: 0 },
  );
}

/** "$24.6k" style compact currency for tight stat tiles. */
export function compactMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 100) / 10}k`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function conversionRate(sold: number, visits: number) {
  return visits > 0 ? `${((sold / visits) * 100).toFixed(1)}%` : "0%";
}
