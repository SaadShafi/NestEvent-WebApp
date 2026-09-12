"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { TicketTypeCard } from "../../../_components/event-overview";
import { useDraft, WIZARD, writeTicketStash } from "../_lib/use-draft";

export default function TicketTypesPage() {
  const router = useRouter();
  const toast = useToast();
  const { draft, patch, ready } = useDraft();
  const tickets = draft?.ticketTypes ?? [];
  const backHref = draft?.visibility === "password" ? WIZARD.password : WIZARD.visibility;

  return (
    <FlowPage title="Back" backHref={backHref} width="sm">
      <div className="flex flex-col gap-6">
        <DisplayTitle sub="Add at least one ticket type.">Ticket Types</DisplayTitle>

        {!ready ? (
          <p className="text-dim">Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="rounded-[24px] bg-surface-2 px-6 py-6 text-sm text-dim">No ticket types yet. Add your first one below.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((t, i) => (
              <TicketTypeCard
                key={t.id}
                ticket={t}
                highlighted={i === 0}
                onEdit={() => router.push(`${WIZARD.ticketsAdd}?edit=${t.id}`)}
                onDelete={() => {
                  patch({ ticketTypes: tickets.filter((x) => x.id !== t.id) });
                  toast(`${t.name} removed`, "info");
                }}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            writeTicketStash(null);
            router.push(WIZARD.ticketsAdd);
          }}
          className="h-13 rounded-full border border-accent text-[15px] font-semibold text-accent transition hover:bg-accent/10"
        >
          + Add Ticket Type
        </button>

        <Button
          variant="white"
          size="lg"
          block
          disabled={!ready}
          onClick={() => {
            if (tickets.length === 0) return toast("Add at least one ticket type", "error");
            patch({ step: 6, price: tickets[0].price });
            router.push(WIZARD.guestList);
          }}
        >
          Next
        </Button>
      </div>
    </FlowPage>
  );
}
