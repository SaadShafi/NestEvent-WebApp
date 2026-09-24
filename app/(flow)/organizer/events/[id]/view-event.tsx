"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useNest } from "@/lib/store";
import type { TicketType } from "@/lib/types";
import { copyText, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  IconAnalytics,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconLink,
  IconPromo,
  IconTrash,
} from "@/components/ui/icons";
import { EventHero, EventOverview, HeroPill } from "../../_components/event-overview";
import { TicketEditorModal } from "../../_components/ticket-editor-modal";
import { useEventOps } from "./_lib/event-ops";
import { IconCash, IconGift, IconReceipt, IconScan } from "./_lib/ops-ui";

type Panel = "links" | "promo" | null;

const rowIcon = "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-accent";

/** Navigation row (right chevron) into one of the event's management screens. */
function LinkRow({ href, icon, title, sub, badge }: { href: string; icon: ReactNode; title: string; sub: string; badge?: number }) {
  return (
    <Link href={href} className="flex w-full items-center gap-4 rounded-[28px] bg-surface-2 px-5 py-4 transition hover:bg-surface-3/40">
      <span className={rowIcon}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[17px] font-medium text-text">{title}</span>
        <span className="text-sm text-dim">{sub}</span>
      </span>
      {!!badge && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-accent px-2 text-xs font-semibold text-white">{badge}</span>
      )}
      <IconChevronRight size={20} className="shrink-0 text-text" />
    </Link>
  );
}

function ActionRow({
  icon,
  title,
  sub,
  open,
  onClick,
  children,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-surface-2">
      <button type="button" onClick={onClick} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-3/40">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-accent">{icon}</span>
        <span className="flex flex-1 flex-col">
          <span className="text-[17px] font-medium text-text">{title}</span>
          <span className="text-sm text-dim">{sub}</span>
        </span>
        {open ? <IconChevronDown size={20} className="text-text" /> : <IconChevronRight size={20} className="text-text" />}
      </button>
      {open && <div className="animate-fade-in border-t border-border px-5 py-5">{children}</div>}
    </div>
  );
}

export function ViewEvent({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const hydrated = useNest((s) => s.hydrated);
  const event = useNest((s) => s.events.find((e) => e.id === id));
  const setDraft = useNest((s) => s.setDraft);
  const deleteEvent = useNest((s) => s.deleteEvent);
  const updateEvent = useNest((s) => s.updateEvent);
  const { refunds } = useEventOps(event);
  const pendingRefunds = refunds.filter((r) => r.status === "pending").length;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [links, setLinks] = useState([
    { id: "l1", label: "Instagram bio", url: `https://nest.app/e/${id}?ref=ig`, clicks: 412 },
    { id: "l2", label: "Email campaign", url: `https://nest.app/e/${id}?ref=email`, clicks: 187 },
  ]);
  const [promos, setPromos] = useState<{ id: string; code: string; off: number; uses: number }[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoOff, setPromoOff] = useState(10);

  if (!hydrated) {
    return (
      <FlowPage title="Back" backHref="/organizer/events" width="xl">
        <p className="text-dim">Loading…</p>
      </FlowPage>
    );
  }
  if (!event) {
    return (
      <FlowPage title="Back" backHref="/organizer/events" width="xl">
        <div className="flex flex-col items-start gap-4">
          <p className="text-lg text-text">This event no longer exists.</p>
          <Button variant="white" href="/organizer/events">
            Back to My Events
          </Button>
        </div>
      </FlowPage>
    );
  }

  const onEdit = () => {
    setDraft({ ...event, step: 1 });
    router.push("/organizer/events/new/details");
  };
  const onDelete = () => {
    deleteEvent(event.id);
    setConfirmDelete(false);
    toast("Event deleted", "success");
    router.push("/organizer/events");
  };
  const addPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return toast("Enter a promo code", "error");
    if (promos.some((p) => p.code === code)) return toast("That code already exists", "error");
    setPromos((p) => [{ id: uid("pc"), code, off: promoOff, uses: 0 }, ...p]);
    setPromoCode("");
    toast(`Promo code ${code} created`, "success");
  };

  return (
    <FlowPage title="Back" backHref="/organizer/events" width="xl">
      <div className="flex flex-col gap-10">
        <EventHero
          cover={event.cover}
          poster={event.flyer ?? event.cover}
          actions={
            <>
              <HeroPill onClick={onEdit} icon={<IconEdit size={13} />}>
                Edit
              </HeroPill>
              <HeroPill onClick={() => setConfirmDelete(true)} tone="danger" icon={<IconTrash size={13} />}>
                Delete
              </HeroPill>
            </>
          }
          cta={
            <Button variant="white" href={`/organizer/events/${event.id}/attendees`} className="min-w-[160px]">
              Attendees
            </Button>
          }
        />

        <EventOverview
          event={event}
          detailsLabel="Event Details"
          onEditTicket={(t) => setEditing(t)}
          rightExtra={
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="lg"
                block
                href={`/organizer/events/${event.id}/complimentary`}
                icon={<IconGift size={20} />}
              >
                Send Complimentary Tickets
              </Button>

              <LinkRow
                href={`/organizer/events/${event.id}/analytics`}
                icon={<IconAnalytics size={22} />}
                title="View Analytics"
                sub="Revenue, Tickets Sold, Page Visits"
              />

              <ActionRow
                icon={<IconLink size={22} />}
                title="Tracking Links"
                sub="Track clicks, sales & revenue"
                open={panel === "links"}
                onClick={() => setPanel(panel === "links" ? null : "links")}
              >
                <div className="flex flex-col gap-3">
                  {links.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-[18px] bg-surface px-4 py-3">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-medium text-text">{l.label}</span>
                        <span className="truncate text-xs text-dim">{l.url}</span>
                      </div>
                      <span className="text-xs text-muted">{l.clicks} clicks</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const ok = await copyText(l.url);
                          setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, clicks: x.clicks + 1 } : x)));
                          toast(ok ? "Link copied" : "Could not copy link", ok ? "success" : "error");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </ActionRow>

              <ActionRow
                icon={<IconPromo size={22} />}
                title="Promo Code"
                sub="Manage discounts and performance"
                open={panel === "promo"}
                onClick={() => setPanel(panel === "promo" ? null : "promo")}
              >
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[1fr_110px_auto] items-end gap-2">
                    <Field label="Code">
                      <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="SUMMER25" />
                    </Field>
                    <Field label="% Off">
                      <Input type="number" min={1} max={100} value={promoOff} onChange={(e) => setPromoOff(Number(e.target.value))} />
                    </Field>
                    <Button variant="primary" onClick={addPromo}>
                      Create
                    </Button>
                  </div>
                  {promos.length === 0 ? (
                    <p className="text-sm text-dim">No promo codes yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {promos.map((p) => (
                        <li key={p.id} className="flex items-center justify-between rounded-[18px] bg-surface px-4 py-3 text-sm">
                          <span className="font-semibold tracking-wide text-text">{p.code}</span>
                          <span className="text-accent">{p.off}% off</span>
                          <span className="text-dim">{p.uses} uses</span>
                          <button type="button" onClick={() => setPromos((ps) => ps.filter((x) => x.id !== p.id))} className="text-danger hover:underline">
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </ActionRow>

              <LinkRow
                href={`/organizer/events/${event.id}/scan`}
                icon={<IconScan size={22} />}
                title="Scan Tickets"
                sub="Check in attendees at the door"
              />
              <LinkRow
                href={`/organizer/events/${event.id}/orders`}
                icon={<IconReceipt size={22} />}
                title="Orders"
                sub="View ticket orders"
              />
              <LinkRow
                href={`/organizer/events/${event.id}/refunds`}
                icon={<IconCash size={22} />}
                title="Refund Requests"
                sub="Approve or decline"
                badge={pendingRefunds}
              />
            </div>
          }
        />
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete event?">
        <p className="text-sm text-muted">
          This will permanently remove <span className="font-semibold text-text">{event.title}</span> and all of its ticket types.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete} icon={<IconTrash size={16} />}>
            Delete Event
          </Button>
        </div>
      </Modal>

      <TicketEditorModal
        ticket={editing}
        onClose={() => setEditing(null)}
        onSave={(t) => {
          updateEvent(event.id, {
            ticketTypes: event.ticketTypes.map((x) => (x.id === t.id ? t : x)),
            price: event.ticketTypes[0]?.id === t.id ? t.price : event.price,
          });
          setEditing(null);
          toast("Ticket type updated", "success");
        }}
      />
    </FlowPage>
  );
}
