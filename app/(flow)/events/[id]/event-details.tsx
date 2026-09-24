"use client";

import Image from "next/image";
import { useState } from "react";
import { AVATARS, formatLongDate, formatTime12 } from "@/lib/data";
import { useNest } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { IconCalendarSolid, IconChevronRight, IconClose, IconDoc, IconPin } from "@/components/ui/icons";
import { MapView } from "@/components/ui/map-view";
import { Avatar, AvatarGroup, EmptyState, Rating } from "@/components/ui/primitives";

type Panel = "location" | "time" | "info" | null;

function shortCountry(c?: string) {
  if (!c) return "";
  if (/^(usa|united states)/i.test(c)) return "US";
  if (/^(united kingdom)/i.test(c)) return "UK";
  return c;
}

export function EventDetails({ id }: { id: string }) {
  const event = useNest((s) => s.events.find((e) => e.id === id));
  // Guests who already bought tickets get "Ticket Order" instead of Buy (Figma: My Tickets → Event Details).
  const order = useNest((s) => s.orders.find((o) => o.eventId === id));
  const [more, setMore] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [mapOpen, setMapOpen] = useState(true);

  if (!event) {
    return (
      <FlowPage title="Event Details" backHref="/dashboard" width="md">
        <EmptyState title="Event not found" sub="This event may have been removed or the link is wrong." action={<Button href="/dashboard">Back to Dashboard</Button>} />
      </FlowPage>
    );
  }

  const short = event.description.length > 150 && !more ? event.description.slice(0, 150).trimEnd() : event.description;
  const cityLine = [event.location.city, shortCountry(event.location.country)].filter(Boolean).join(", ") || event.location.address;
  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  return (
    <FlowPage title="Event Details" width="xl">
      <div className="flex flex-col gap-10">
        {/* Hero */}
        <div className="relative h-[280px] w-full overflow-hidden rounded-[28px] bg-surface-2">
          <Image src={event.cover} alt="" fill sizes="1200px" className="scale-110 object-cover blur-2xl" aria-hidden />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="relative h-[220px] w-[155px] overflow-hidden rounded-[8px] shadow-2xl">
              <Image src={event.cover} alt={event.title} fill sizes="155px" className="object-cover" priority />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
          {/* Left */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-1">
              <p className="text-[15px] text-dim">{event.subtitle ?? event.category}</p>
              <h1 className="text-[32px] font-semibold leading-tight text-text">{event.title}</h1>
              {event.tagline && <p className="text-[18px] text-muted">{event.tagline}</p>}
            </div>

            <div className="flex items-center gap-4">
              <Avatar src={event.organizerLogo} size={56} alt={event.organizerName} />
              <div className="flex flex-col">
                <span className="text-[20px] font-semibold text-text">{event.organizerName}</span>
                <Rating value={event.organizerRating ?? 0} count={event.organizerRatingCount} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-semibold text-text">Description</h2>
              <p className="max-w-[460px] text-[16px] leading-relaxed text-muted">
                {short}
                {event.description.length > 150 && (
                  <>
                    {!more && "… "}
                    <button type="button" onClick={() => setMore((v) => !v)} className="text-accent hover:underline">
                      {more ? " Read Less" : "Read More.."}
                    </button>
                  </>
                )}
              </p>
            </div>

            {order ? (
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <Button href={`/tickets/${order.id}`} variant="white" size="lg" className="min-w-[200px] flex-1 sm:flex-none">
                  Ticket Order
                </Button>
                <Button href={`/events/${event.id}/checkout`} variant="ghost" size="lg" className="flex-1 sm:flex-none">
                  Buy More
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[13px] text-dim">Price</span>
                  <span className="text-[22px] font-medium text-text">
                    $ {event.price.toFixed(2)}
                    <span className="text-[14px] text-muted">/Person</span>
                  </span>
                </div>
                <Button href={`/events/${event.id}/checkout`} size="lg" className="min-w-[200px]">
                  {event.attendance === "rsvp" ? "RSVP" : "Buy Ticket"}
                </Button>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-[20px] font-semibold text-text">Attendees</h2>
              <div className="flex items-center gap-4">
                <AvatarGroup srcs={AVATARS} size={36} />
                <span className="text-[16px] text-muted">{event.guests}+ Guestlist</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <InfoRow
                icon={<IconPin size={22} />}
                top={cityLine}
                bottom={event.venue || event.location.address}
                open={panel === "location"}
                onClick={() => toggle("location")}
              >
                <p className="text-sm text-muted">{event.location.address}</p>
                {event.location.zipcode && <p className="text-xs text-dim">Zip {event.location.zipcode}</p>}
              </InfoRow>
              <InfoRow
                icon={<IconCalendarSolid size={22} />}
                top={`${formatTime12(event.startTime)} - ${formatLongDate(event.startDate)}`}
                bottom={`${formatTime12(event.startTime)} – ${formatTime12(event.endTime)}`}
                open={panel === "time"}
                onClick={() => toggle("time")}
              >
                <p className="text-sm text-muted">
                  Starts {formatLongDate(event.startDate)} at {formatTime12(event.startTime)}
                </p>
                <p className="text-sm text-muted">
                  Ends {formatLongDate(event.endDate)} at {formatTime12(event.endTime)}
                </p>
              </InfoRow>
              <InfoRow
                icon={<IconDoc size={22} />}
                top="Event Information"
                bottom="FAQs · Rules · Dress code · Parking"
                open={panel === "info"}
                onClick={() => toggle("info")}
              >
                <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
                  {[
                    ["FAQs", event.faqs],
                    ["Rules", event.rules],
                    ["Dress code", event.dressCode],
                    ["Parking", event.parking],
                  ].map(([k, v]) => (
                    <FragmentRow key={k} k={k!} v={v} />
                  ))}
                </dl>
              </InfoRow>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] font-semibold text-text">Location</h2>
              <div className="flex items-center justify-between gap-3 px-2">
                <span className="flex items-center gap-3 text-[15px] text-text">
                  <IconPin size={20} className="shrink-0 text-accent" />
                  {event.location.address || event.venue}
                </span>
                <button
                  type="button"
                  onClick={() => setMapOpen((v) => !v)}
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-white transition",
                    mapOpen ? "bg-accent hover:brightness-110" : "bg-surface-3 hover:bg-accent",
                  )}
                  aria-label={mapOpen ? "Hide map" : "Show map"}
                  title={mapOpen ? "Hide map" : "Show map"}
                >
                  {mapOpen ? <IconClose size={12} /> : <IconPin size={12} />}
                </button>
              </div>
              {mapOpen && <MapView lat={event.location.lat} lng={event.location.lng} address={event.location.address || [event.venue, event.location.city, event.location.country].filter(Boolean).join(", ")} label={event.venue} className="h-[180px]" />}
            </div>
          </div>
        </div>
      </div>
    </FlowPage>
  );
}

function FragmentRow({ k, v }: { k: string; v?: string }) {
  return (
    <>
      <dt className="text-dim">{k}</dt>
      <dd className="text-muted">{v || "Not specified"}</dd>
    </>
  );
}

function InfoRow({
  icon,
  top,
  bottom,
  open,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  top: string;
  bottom: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <button type="button" onClick={onClick} className="flex items-center gap-4 rounded-[20px] px-2 py-3 text-left transition hover:bg-surface-2" aria-expanded={open}>
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-surface text-accent">{icon}</span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[15px] text-dim">{top}</span>
          <span className="text-[17px] font-medium text-text">{bottom}</span>
        </span>
        <IconChevronRight size={20} className={cn("shrink-0 text-text transition-transform", open && "rotate-90")} />
      </button>
      {open && <div className="animate-fade-in ml-[68px] flex flex-col gap-1 rounded-[18px] bg-surface-2 px-4 py-3">{children}</div>}
    </div>
  );
}
