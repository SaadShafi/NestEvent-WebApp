"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { PEOPLE } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { EventItem, OrderTicket } from "@/lib/types";

/**
 * Organizer event operations (orders, door scanning, refunds, complimentary tickets).
 * The global store only knows the signed-in user's own purchases, so each event is padded
 * with deterministic demo orders; everything the organizer does here lives in sessionStorage.
 */

export type OrderSource = "purchase" | "demo" | "comp";
export type RefundStatus = "pending" | "refunded" | "declined";

export interface OpsOrder {
  id: string;
  number: string;
  eventId: string;
  buyerName: string;
  buyerAvatar?: string;
  tickets: OrderTicket[];
  tax: number;
  total: number;
  createdAt: string;
  source: OrderSource;
  guestList: boolean;
  refund?: RefundStatus;
}

export interface CompTicket {
  id: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientContact: string;
  ticketTypeId: string;
  ticketTypeName: string;
  qty: number;
  code: string;
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  order: OpsOrder;
  reason: string;
  requestedAt: string;
  status: RefundStatus;
}

export type ScanOutcome =
  | { state: "valid" | "already"; order: OpsOrder; ticket: OrderTicket; scannedAt: string }
  | { state: "invalid"; code: string; reason: string };

/* ---------- deterministic helpers ---------- */

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Small seeded PRNG (mulberry32) so demo data is stable per event. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function seededCode(rand: () => number) {
  let out = "NEST-";
  for (let i = 0; i < 10; i++) out += CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)];
  return out;
}

/** Figma order numbers look like "#NG2248219". */
export function orderNumber(id: string) {
  return `#NG${String(hash(id) % 10_000_000).padStart(7, "0")}`;
}

/** Codes are compared without separators / case so "nest xxxx" still matches. */
export function normalizeCode(code: string) {
  const raw = code.trim().split("|").pop() ?? "";
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const GUESTS = PEOPLE.filter((p) => p.avatar.includes("/avatars/"));

/** Stable, fake phone numbers for the guest directory. */
export function guestPhone(id: string) {
  const n = String(hash(id)).padStart(10, "0").slice(-7);
  return `+1 (555) ${n.slice(0, 3)}-${n.slice(3)}`;
}

export const COMP_GUESTS = GUESTS.map((p) => ({
  id: p.id,
  name: p.name,
  avatar: p.avatar,
  phone: guestPhone(p.id),
  email: `${p.name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@email.com`,
}));

const REFUND_REASONS = [
  "I can no longer attend because of a family emergency.",
  "Bought the wrong ticket type by mistake.",
  "The event date clashes with a work trip.",
  "Charged twice for the same order.",
  "Feeling unwell and won't be able to make it.",
];

function demoOrders(event: EventItem): OpsOrder[] {
  const rand = rng(hash(event.id));
  const types = event.ticketTypes.length
    ? event.ticketTypes
    : [{ id: "ga", name: "General Admission", price: event.price || 25 }];
  const base = new Date(event.createdAt ?? `${event.startDate}T12:00:00`).getTime();
  const origin = Number.isNaN(base) ? Date.UTC(2026, 0, 1) : base;

  return Array.from({ length: 8 }, (_, i) => {
    const person = GUESTS[(i + (hash(event.id) % GUESTS.length)) % GUESTS.length];
    const type = types[Math.floor(rand() * types.length)];
    const qty = 1 + Math.floor(rand() * 3);
    const subtotal = qty * type.price;
    const tax = Math.round(subtotal * 0.0102 * 100) / 100;
    const id = `${event.id}-demo-${i}`;
    return {
      id,
      number: orderNumber(id),
      eventId: event.id,
      buyerName: person.name,
      buyerAvatar: person.avatar,
      tickets: [
        {
          id: `${id}-t`,
          ticketTypeId: type.id,
          ticketTypeName: type.name,
          qty,
          unitPrice: type.price,
          code: seededCode(rand),
        },
      ],
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
      createdAt: new Date(origin + (i + 1) * 7.5 * 3600_000).toISOString(),
      source: "demo" as const,
      guestList: /guest/i.test(type.name),
    };
  });
}

/** Seeded refund requests: indexes into the demo orders + their initial status. */
const REFUND_SEED: { order: number; status: RefundStatus }[] = [
  { order: 1, status: "pending" },
  { order: 3, status: "pending" },
  { order: 4, status: "pending" },
  { order: 6, status: "refunded" },
  { order: 7, status: "declined" },
];

/* ---------- sessionStorage-backed state ---------- */

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readRaw(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** JSON value in sessionStorage shared by every component using the same key. `fallback` must be a stable constant. */
function useSessionValue<T>(key: string, fallback: T) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo<T>(() => {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const update = useCallback(
    (fn: (prev: T) => T) => {
      let prev = fallback;
      const current = readRaw(key);
      if (current) {
        try {
          prev = JSON.parse(current) as T;
        } catch {
          /* keep fallback */
        }
      }
      try {
        sessionStorage.setItem(key, JSON.stringify(fn(prev)));
      } catch {
        /* storage unavailable: nothing to persist */
      }
      listeners.forEach((l) => l());
    },
    [key, fallback],
  );
  return [value, update] as const;
}

const NO_SCANS: Record<string, string> = {};
const NO_COMPS: CompTicket[] = [];
const NO_REFUNDS: Record<string, RefundStatus> = {};

const keyFor = (eventId: string, part: string) => `nest:event-ops:${eventId}:${part}`;

/** Everything the organizer ops screens need for one event. */
export function useEventOps(event: EventItem | undefined) {
  const eventId = event?.id ?? "none";
  const storeOrders = useNest((s) => s.orders);
  const user = useNest((s) => s.user);
  const [scans, setScans] = useSessionValue(keyFor(eventId, "scans"), NO_SCANS);
  const [comps, setComps] = useSessionValue(keyFor(eventId, "comps"), NO_COMPS);
  const [refundState, setRefundState] = useSessionValue(keyFor(eventId, "refunds"), NO_REFUNDS);

  const demo = useMemo(() => (event ? demoOrders(event) : []), [event]);

  const refunds = useMemo<RefundRequest[]>(() => {
    const rand = rng(hash(`${eventId}-refunds`));
    return REFUND_SEED.filter((s) => demo[s.order]).map((s, i) => {
      const order = demo[s.order];
      const id = `${order.id}-refund`;
      return {
        id,
        order,
        reason: REFUND_REASONS[Math.floor(rand() * REFUND_REASONS.length)],
        requestedAt: new Date(new Date(order.createdAt).getTime() + (i + 2) * 5 * 3600_000).toISOString(),
        status: refundState[id] ?? s.status,
      };
    });
  }, [demo, eventId, refundState]);

  const orders = useMemo<OpsOrder[]>(() => {
    const buyer = user ? `${user.firstName} ${user.lastName}`.trim() : "Guest";
    const purchases: OpsOrder[] = storeOrders
      .filter((o) => o.eventId === eventId)
      .map((o) => ({
        id: o.id,
        number: orderNumber(o.id),
        eventId: o.eventId,
        buyerName: o.address?.fullName || buyer,
        buyerAvatar: user?.avatar,
        tickets: o.tickets,
        tax: o.tax,
        total: o.total,
        createdAt: o.createdAt,
        source: "purchase",
        guestList: o.tickets.some((t) => /guest/i.test(t.ticketTypeName)),
      }));
    const complimentary: OpsOrder[] = comps.map((c) => ({
      id: c.id,
      number: orderNumber(c.id),
      eventId,
      buyerName: c.recipientName,
      buyerAvatar: c.recipientAvatar,
      tickets: [{ id: `${c.id}-t`, ticketTypeId: c.ticketTypeId, ticketTypeName: c.ticketTypeName, qty: c.qty, unitPrice: 0, code: c.code }],
      tax: 0,
      total: 0,
      createdAt: c.createdAt,
      source: "comp",
      guestList: true,
    }));
    const refundByOrder = new Map(refunds.map((r) => [r.order.id, r.status]));
    return [...purchases, ...complimentary, ...demo]
      .map((o) => ({ ...o, refund: refundByOrder.get(o.id) }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [storeOrders, eventId, user, comps, demo, refunds]);

  /** Looks a code up without marking it (used before confirming a scan). */
  const lookup = useCallback(
    (code: string) => {
      const n = normalizeCode(code);
      if (!n) return null;
      for (const order of orders) {
        const ticket = order.tickets.find((t) => normalizeCode(t.code) === n);
        if (ticket) return { order, ticket };
      }
      return null;
    },
    [orders],
  );

  /** Validates a scanned / typed code and checks the ticket in when it's valid. */
  const scan = useCallback(
    (code: string): ScanOutcome => {
      const found = lookup(code);
      if (!found) {
        const elsewhere = storeOrders.some(
          (o) => o.eventId !== eventId && o.tickets.some((t) => normalizeCode(t.code) === normalizeCode(code)),
        );
        return {
          state: "invalid",
          code: code.trim(),
          reason: elsewhere ? "This ticket belongs to a different event." : "No ticket with this code exists for this event.",
        };
      }
      if (found.order.refund === "refunded") {
        return { state: "invalid", code: found.ticket.code, reason: "This ticket was refunded and is no longer valid." };
      }
      const prev = scans[found.ticket.code];
      if (prev) return { state: "already", ...found, scannedAt: prev };
      const now = new Date().toISOString();
      setScans((s) => ({ ...s, [found.ticket.code]: now }));
      return { state: "valid", ...found, scannedAt: now };
    },
    [lookup, storeOrders, eventId, scans, setScans],
  );

  const markScanned = useCallback(
    (ticketCode: string) => setScans((s) => (s[ticketCode] ? s : { ...s, [ticketCode]: new Date().toISOString() })),
    [setScans],
  );

  const addComp = useCallback((c: CompTicket) => setComps((list) => [c, ...list]), [setComps]);

  const resolveRefund = useCallback(
    (id: string, status: Exclude<RefundStatus, "pending">) => setRefundState((s) => ({ ...s, [id]: status })),
    [setRefundState],
  );

  return { orders, scans, scan, lookup, markScanned, comps, addComp, refunds, resolveRefund };
}

/* ---------- formatting ---------- */

/** "Aug 30, 7:30 AM" — scan / order timestamps. */
export function stamp(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export const ticketCount = (o: OpsOrder) => o.tickets.reduce((n, t) => n + t.qty, 0);

export const ticketLabel = (o: OpsOrder) =>
  o.tickets.map((t) => (t.qty > 1 ? `${t.ticketTypeName} × ${t.qty}` : t.ticketTypeName)).join(", ");

/**
 * One scannable row per ticket unit (an order line with qty 3 = 3 rows). Unit 1 uses the ticket's
 * own code — the one the QR scanner marks — and further units get "<code>#n" keys.
 */
export function ticketUnits(order: OpsOrder) {
  return order.tickets.flatMap((t) =>
    Array.from({ length: Math.max(1, t.qty) }, (_, i) => ({ key: i === 0 ? t.code : `${t.code}#${i + 1}`, ticket: t, order })),
  );
}

/** Short ticket-type tag for refund cards: "General" → "GA", "VIP" → "VIP", "Early Bird" → "EB". */
export function ticketTag(name: string) {
  if (/general/i.test(name)) return "GA";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return name.length <= 4 ? name.toUpperCase() : name.slice(0, 2).toUpperCase();
}
