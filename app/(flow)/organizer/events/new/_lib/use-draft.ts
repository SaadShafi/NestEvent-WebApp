"use client";

import { useEffect } from "react";
import { useNest, type DraftEvent } from "@/lib/store";
import { uid } from "@/lib/utils";

/**
 * Ensures a persisted wizard draft exists and exposes it with a patch helper.
 * `draft` is null until the store has hydrated and a draft has been created.
 */
export function useDraft() {
  const hydrated = useNest((s) => s.hydrated);
  const draft = useNest((s) => s.draft);
  const setDraft = useNest((s) => s.setDraft);
  const patch = useNest((s) => s.patchDraft);

  useEffect(() => {
    if (hydrated && !draft) setDraft({ id: uid("draft"), step: 1 });
  }, [hydrated, draft, setDraft]);

  return { draft, patch, setDraft, ready: hydrated && !!draft };
}

export type { DraftEvent };

/** Route helpers for the wizard. */
export const WIZARD = {
  details: "/organizer/events/new/details",
  eventDetails: "/organizer/events/new/event-details",
  aiFlyer: "/organizer/events/new/ai-flyer",
  attendance: "/organizer/events/new/attendance",
  visibility: "/organizer/events/new/visibility",
  password: "/organizer/events/new/password",
  tickets: "/organizer/events/new/tickets",
  ticketsAdd: "/organizer/events/new/tickets/add",
  ticketsRestrictions: "/organizer/events/new/tickets/restrictions",
  guestList: "/organizer/events/new/guest-list",
  review: "/organizer/events/new/review",
  boost: "/organizer/events/new/boost",
  success: "/organizer/events/new/success",
} as const;

/** The step after visibility/password depends on the attendance model. */
export function afterAccessStep(draft: DraftEvent | null) {
  return draft?.attendance === "rsvp" ? WIZARD.guestList : WIZARD.tickets;
}

export const TICKET_STASH_KEY = "nest-ticket-draft";

export interface TicketStash {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  startTime: string;
  endTime: string;
  minPerOrder: number;
  maxPerOrder: number;
}

export function readTicketStash(): TicketStash | null {
  try {
    const raw = sessionStorage.getItem(TICKET_STASH_KEY);
    return raw ? (JSON.parse(raw) as TicketStash) : null;
  } catch {
    return null;
  }
}

export function writeTicketStash(v: TicketStash | null) {
  try {
    if (v) sessionStorage.setItem(TICKET_STASH_KEY, JSON.stringify(v));
    else sessionStorage.removeItem(TICKET_STASH_KEY);
  } catch {
    /* ignore */
  }
}
