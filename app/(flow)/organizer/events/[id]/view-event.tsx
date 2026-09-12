"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { money } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { TicketType } from "@/lib/types";
import { cn, copyText, isEmail, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
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

type Panel = "analytics" | "links" | "promo" | null;

/** Deterministic pseudo-random page visits so the number is stable per event. */
function fakeVisits(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 1200 + (h % 8000);
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
  const orders = useNest((s) => s.orders);
  const setDraft = useNest((s) => s.setDraft);
  const deleteEvent = useNest((s) => s.deleteEvent);
  const updateEvent = useNest((s) => s.updateEvent);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [comp, setComp] = useState(false);
  const [compEmail, setCompEmail] = useState("");
  const [compType, setCompType] = useState("");
  const [compQty, setCompQty] = useState(1);
  const [panel, setPanel] = useState<Panel>(null);
  const [links, setLinks] = useState([
    { id: "l1", label: "Instagram bio", url: `https://nest.app/e/${id}?ref=ig`, clicks: 412 },
    { id: "l2", label: "Email campaign", url: `https://nest.app/e/${id}?ref=email`, clicks: 187 },
  ]);
  const [promos, setPromos] = useState<{ id: string; code: string; off: number; uses: number }[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoOff, setPromoOff] = useState(10);

  const stats = useMemo(() => {
    const mine = orders.filter((o) => o.eventId === id);
    const revenue = mine.reduce((a, o) => a + o.total, 0);
    const sold = mine.reduce((a, o) => a + o.tickets.reduce((b, t) => b + t.qty, 0), 0);
    return { revenue, sold, visits: fakeVisits(id) };
  }, [orders, id]);

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
  const sendComp = () => {
    if (!isEmail(compEmail)) return toast("Enter a valid email address", "error");
    if (!compType) return toast("Choose a ticket type", "error");
    setComp(false);
    setCompEmail("");
    toast("Complimentary tickets sent", "success");
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
              <Button variant="outline" size="lg" block onClick={() => setComp(true)}>
                Send Complimentary Tickets
              </Button>

              <ActionRow
                icon={<IconAnalytics size={22} />}
                title="View Analytics"
                sub="Revenue, Tickets Sold, Page Visits"
                open={panel === "analytics"}
                onClick={() => setPanel(panel === "analytics" ? null : "analytics")}
              >
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Revenue", value: money(stats.revenue) },
                    { label: "Tickets Sold", value: stats.sold.toLocaleString("en-US") },
                    { label: "Page Visits", value: stats.visits.toLocaleString("en-US") },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col gap-1 rounded-[18px] bg-surface px-4 py-4">
                      <span className="text-xs text-dim">{s.label}</span>
                      <span className="text-[20px] font-semibold text-text">{s.value}</span>
                    </div>
                  ))}
                </div>
              </ActionRow>

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

      <Modal open={comp} onClose={() => setComp(false)} title="Send Complimentary Tickets">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendComp();
          }}
        >
          <Field label="Recipient Email">
            <Input type="email" value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="guest@email.com" />
          </Field>
          <Field label="Ticket Type">
            <Select
              placeholder="Choose ticket type"
              value={compType}
              onChange={(e) => setCompType(e.target.value)}
              options={event.ticketTypes.map((t) => ({ value: t.id, label: `${t.name} · ${money(t.price)}` }))}
            />
          </Field>
          <Field label="Quantity">
            <Input type="number" min={1} max={10} value={compQty} onChange={(e) => setCompQty(Math.max(1, Number(e.target.value)))} />
          </Field>
          <Button type="submit" variant="white" block className={cn("mt-2")}>
            Send Tickets
          </Button>
        </form>
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
