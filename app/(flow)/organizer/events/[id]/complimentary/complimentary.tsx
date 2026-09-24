"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import type { EventItem } from "@/lib/types";
import { cn, isEmail, ticketCode, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Counter, Input } from "@/components/ui/form";
import { Avatar, EmptyState, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconMail } from "@/components/ui/icons";
import { ticketDetails } from "../../../_components/event-overview";
import { COMP_GUESTS, useEventOps } from "../_lib/event-ops";
import { OpsPage } from "../_lib/ops-ui";

interface Recipient {
  name: string;
  avatar?: string;
  contact: string;
}

export function ComplimentaryTickets({ id }: { id: string }) {
  return (
    <OpsPage id={id} title="Complimentary Tickets" width="md" asideClassName="md:w-auto!">
      {(event) => <ComplimentaryForm event={event} />}
    </OpsPage>
  );
}

/** Send Complimentary Tickets — pick a guest, choose a ticket type + quantity, send for free. */
function ComplimentaryForm({ event }: { event: EventItem }) {
  const router = useRouter();
  const toast = useToast();
  const { comps, addComp } = useEventOps(event);
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [typeId, setTypeId] = useState("");
  const [qty, setQty] = useState(1);

  const sentTo = useMemo(() => new Set(comps.map((c) => c.recipientContact)), [comps]);

  const q = query.trim().toLowerCase();
  const guests = useMemo(
    () => (q ? COMP_GUESTS.filter((g) => [g.name, g.phone, g.email].some((v) => v.toLowerCase().includes(q))) : COMP_GUESTS),
    [q],
  );
  // Anyone not in the directory can still be invited by typing their email.
  const emailInvite = isEmail(q) && !guests.some((g) => g.email === q) ? q : null;

  const types = event.ticketTypes;
  const selected = types.find((t) => t.id === typeId);

  const open = (r: Recipient) => {
    if (!types.length) return toast("Add a ticket type to this event first", "error");
    setRecipient(r);
    setTypeId(types[0].id);
    setQty(1);
  };

  const send = () => {
    if (!recipient || !selected) return;
    addComp({
      id: uid("comp"),
      recipientName: recipient.name,
      recipientAvatar: recipient.avatar,
      recipientContact: recipient.contact,
      ticketTypeId: selected.id,
      ticketTypeName: selected.name,
      qty,
      code: ticketCode(),
      createdAt: new Date().toISOString(),
    });
    setRecipient(null);
    router.push(`/organizer/events/${event.id}/complimentary/sent`);
  };

  return (
    // Figma: search field + a single column of guests (name + Send Ticket / Sent)
    <div className="flex max-w-[518px] flex-col gap-7">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search By Name, Phone, Email"
        aria-label="Search guests"
        className="h-14! border-white/5! bg-[#121212]! px-6! text-[16px]! md:h-[74px]! md:text-[18px]!"
      />

      {emailInvite && (
        <GuestRow
          name={emailInvite}
          sub="Invite by email"
          icon={<IconMail size={20} />}
          sent={sentTo.has(emailInvite)}
          onSend={() => open({ name: emailInvite, contact: emailInvite })}
        />
      )}

      {guests.length === 0 && !emailInvite ? (
        <EmptyState title="No guests found" sub="Try a different name or phone number, or type a full email address to invite someone new." />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-[30px]">
          {guests.map((g) => (
            <GuestRow
              key={g.id}
              name={g.name}
              avatar={g.avatar}
              sent={sentTo.has(g.email)}
              onSend={() => open({ name: g.name, avatar: g.avatar, contact: g.email })}
            />
          ))}
        </div>
      )}

      <Modal open={!!recipient} onClose={() => setRecipient(null)} title="Choose Ticket Type" className="max-h-[90dvh] overflow-y-auto">
        {recipient && (
          <div className="flex flex-col gap-4">
            {types.map((t) => {
              const active = t.id === typeId;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-[24px] border bg-surface-2 p-5 transition sm:flex-row sm:items-center",
                    active ? "border-accent" : "border-transparent hover:border-border-soft",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTypeId(t.id);
                      setQty(1);
                    }}
                    className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                    aria-pressed={active}
                  >
                    <span className="font-display text-[20px] font-bold text-text">{t.name}</span>
                    <span className="text-sm text-muted">{ticketDetails(t)}</span>
                  </button>
                  {active && (
                    <div className="self-start sm:self-auto">
                      <Counter value={qty} onChange={setQty} min={1} max={Math.max(1, t.maxPerOrder || 10)} />
                    </div>
                  )}
                </div>
              );
            })}
            <Button variant="white" size="lg" block disabled={!selected} onClick={send} className="mt-2">
              Send Ticket
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function GuestRow({
  name,
  sub,
  avatar,
  icon,
  sent,
  onSend,
}: {
  name: string;
  sub?: string;
  avatar?: string;
  icon?: ReactNode;
  sent: boolean;
  onSend: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-2 sm:gap-6">
      {icon ? (
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-surface text-accent sm:h-[76px] sm:w-[76px]">{icon}</span>
      ) : (
        <Avatar src={avatar} alt={name} size={76} className="max-sm:!h-16 max-sm:!w-16" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[17px] font-semibold text-text sm:text-[20px]">{name}</span>
        {sub && <span className="truncate text-xs text-dim">{sub}</span>}
      </div>
      {sent ? (
        <span className="inline-flex h-10 w-[112px] shrink-0 items-center justify-center rounded-full bg-accent text-[16px] font-semibold text-[#141414] sm:w-[127px] sm:text-[17px]">
          Sent
        </span>
      ) : (
        <button
          type="button"
          onClick={onSend}
          className="inline-flex h-10 w-[112px] shrink-0 items-center justify-center rounded-full bg-surface text-[15px] font-medium text-text transition hover:bg-surface-3 sm:w-[127px] sm:text-[16px]"
        >
          Send Ticket
        </button>
      )}
    </div>
  );
}
