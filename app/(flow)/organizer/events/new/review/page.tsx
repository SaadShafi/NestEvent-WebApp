"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNest } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/shell/flow-layout";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconEdit, IconTrash } from "@/components/ui/icons";
import { EventHero, EventOverview, HeroPill } from "../../../_components/event-overview";
import { useDraft, WIZARD, writeTicketStash } from "../_lib/use-draft";

const FALLBACK_COVER = "/images/posters/party.jpg";

export default function ReviewEventPage() {
  const router = useRouter();
  const toast = useToast();
  const { draft, patch, ready, setDraft } = useDraft();
  const publishDraft = useNest((s) => s.publishDraft);
  const organizations = useNest((s) => s.organizations);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!ready || !draft) {
    return (
      <FlowPage title="Back" backHref={WIZARD.guestList} width="xl">
        <p className="text-dim">Loading…</p>
      </FlowPage>
    );
  }

  const org = organizations.find((o) => o.id === draft.organizationId) ?? organizations[0];
  const cover = draft.cover ?? draft.flyer ?? draft.gallery?.[0] ?? FALLBACK_COVER;
  const overview = {
    ...draft,
    cover,
    organizerName: draft.organizerName ?? org?.name,
    organizerLogo: draft.organizerLogo ?? org?.logo,
    organizerRating: draft.organizerRating ?? org?.rating,
    organizerRatingCount: draft.organizerRatingCount ?? org?.ratingCount,
  };

  const saveDraft = () => {
    const ev = publishDraft("draft");
    if (!ev) return toast("Nothing to save", "error");
    toast("Draft saved", "success");
    router.push("/organizer/events");
  };

  return (
    <FlowPage title="Back" backHref={WIZARD.guestList} width="xl">
      <div className="flex flex-col gap-10">
        <EventHero
          cover={cover}
          poster={draft.flyer ?? cover}
          actions={
            <>
              <HeroPill onClick={() => router.push(WIZARD.details)} icon={<IconEdit size={13} />}>
                Edit
              </HeroPill>
              <HeroPill onClick={() => setConfirmDelete(true)} tone="danger" icon={<IconTrash size={13} />}>
                Delete
              </HeroPill>
            </>
          }
          cta={
            <Button variant="white" className="min-w-[160px] opacity-90" onClick={() => toast("Available after publishing", "info")}>
              Attendees
            </Button>
          }
        />

        <EventOverview
          event={overview}
          detailsLabel="Description"
          onEditTicket={(t) => {
            writeTicketStash(null);
            router.push(`${WIZARD.ticketsAdd}?edit=${t.id}`);
          }}
          onClearLocation={() => patch({ location: { address: "", country: draft.location?.country, city: draft.location?.city, zipcode: draft.location?.zipcode } })}
          footer={
            <>
              <Button variant="white" size="md" onClick={saveDraft} className="min-w-[200px]">
                Save draft
              </Button>
              <Button
                variant="primary"
                size="md"
                className="min-w-[200px]"
                onClick={() => {
                  if (!draft.title?.trim()) {
                    toast("Add an event name before publishing", "error");
                    router.push(WIZARD.details);
                    return;
                  }
                  patch({ step: 8 });
                  router.push(WIZARD.boost);
                }}
              >
                Publish event
              </Button>
            </>
          }
        />
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Discard this event?">
        <p className="text-sm text-muted">Everything you have entered in this wizard will be removed.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Keep editing
          </Button>
          <Button
            variant="danger"
            icon={<IconTrash size={16} />}
            onClick={() => {
              setDraft(null);
              writeTicketStash(null);
              toast("Draft discarded", "info");
              router.push("/organizer/events");
            }}
          >
            Discard
          </Button>
        </div>
      </Modal>
    </FlowPage>
  );
}
