"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { AVATARS, formatTime12 } from "@/lib/data";
import type { LocationValue, TicketType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LocationInput } from "@/components/ui/location-input";
import { MapView } from "@/components/ui/map-view";
import { Avatar, AvatarGroup, Rating } from "@/components/ui/primitives";
import { IconCalendarSolid, IconClose, IconEdit, IconPin, IconTrash } from "@/components/ui/icons";

/** Shape shared by a published EventItem and an in-progress DraftEvent. */
export interface OverviewEvent {
  title?: string;
  subtitle?: string;
  category?: string;
  tagline?: string;
  description?: string;
  cover?: string;
  flyer?: string;
  organizerName?: string;
  organizerLogo?: string;
  organizerRating?: number;
  organizerRatingCount?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  venue?: string;
  location?: LocationValue;
  ticketTypes?: TicketType[];
  guests?: number;
}

const isLocal = (src: string) => src.startsWith("/uploads") || src.startsWith("blob:");

function monthDay(iso?: string) {
  if (!iso) return "";
  return new Date(`${iso}T00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function formatDateRange(start?: string, end?: string) {
  if (!start) return "Date to be announced";
  const year = new Date(`${start}T00:00`).getFullYear();
  if (end && end !== start) return `${monthDay(start)} - ${monthDay(end)} ${year}`;
  return `${monthDay(start)} ${year}`;
}

export function ticketDetails(t: TicketType) {
  const parts = [`$${t.price}`, `Qty ${t.quantity.toLocaleString("en-US")}`];
  if (t.saleEnds) parts.push(`Sale ends ${t.saleEnds}`);
  else parts.push(`Max ${t.maxPerOrder}`);
  if (t.ageRestriction && t.ageRestriction !== "None") parts.push(t.ageRestriction);
  return parts.join(" · ");
}

export function HeroPill({
  children,
  onClick,
  tone = "dark",
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "dark" | "danger";
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-[#141414]/90 px-3.5 text-xs font-medium backdrop-blur transition hover:bg-surface",
        tone === "danger" ? "text-danger" : "text-text",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function EventHero({
  cover,
  poster,
  actions,
  cta,
  className,
}: {
  cover: string;
  poster?: string;
  actions?: ReactNode;
  cta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative h-[280px] w-full overflow-hidden rounded-[28px] bg-surface-2", className)}>
      <Image src={cover} alt="" fill sizes="1200px" className="scale-110 object-cover blur-md opacity-80" unoptimized={isLocal(cover)} aria-hidden />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 top-6 bottom-6 flex justify-center">
        <span className="relative h-full w-[150px] overflow-hidden rounded-[10px] shadow-2xl">
          <Image src={poster ?? cover} alt="" fill sizes="150px" className="object-cover" unoptimized={isLocal(poster ?? cover)} />
        </span>
      </div>
      {actions && <div className="absolute right-6 top-6 flex items-center gap-2">{actions}</div>}
      {cta && <div className="absolute bottom-6 right-6">{cta}</div>}
    </div>
  );
}

export function TicketTypeCard({
  ticket,
  highlighted,
  onEdit,
  onDelete,
}: {
  ticket: TicketType;
  highlighted?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[24px] bg-surface-2 px-5 py-5 border transition sm:px-6 sm:py-6",
        highlighted ? "border-accent" : "border-transparent",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1 break-words font-display text-[20px] font-bold text-text sm:text-[22px]">{ticket.name}</span>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="grid h-8 w-8 place-items-center rounded-full bg-surface-3 text-text transition hover:bg-surface"
                aria-label={`Edit ${ticket.name}`}
                title="Edit"
              >
                <IconEdit size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="grid h-8 w-8 place-items-center rounded-full bg-danger/10 text-danger transition hover:bg-danger/20"
                aria-label={`Delete ${ticket.name}`}
                title="Delete"
              >
                <IconTrash size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="text-sm text-muted">{ticketDetails(ticket)}</p>
    </div>
  );
}

function IconCircle({ children }: { children: ReactNode }) {
  return <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-2 text-accent">{children}</span>;
}

/**
 * Two-column event summary used by "View Event" and "Review Event":
 * left = identity + ticket types, right = attendees, schedule, location.
 */
export function EventOverview({
  event,
  detailsLabel = "Event Details",
  onEditTicket,
  onDeleteTicket,
  onLocationChange,
  onPickOnMap,
  onUseMyLocation,
  rightExtra,
  footer,
}: {
  event: OverviewEvent;
  detailsLabel?: string;
  onEditTicket?: (t: TicketType) => void;
  onDeleteTicket?: (t: TicketType) => void;
  /** Makes the Location section editable (Review Event): search / current-location input above the map. */
  onLocationChange?: (v: LocationValue | null) => void;
  /** Click on the map preview to drop the pin there (only with onLocationChange). */
  onPickOnMap?: (pos: { lat: number; lng: number }) => void;
  /** Orange pin button on the map (Figma): set the location from the device position. */
  onUseMyLocation?: () => void;
  rightExtra?: ReactNode;
  footer?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const description = event.description?.trim() || "No description added yet.";
  const long = description.length > 150;
  const shown = expanded || !long ? description : `${description.slice(0, 150).trimEnd()} `;
  const tickets = event.ticketTypes ?? [];

  return (
    <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] text-dim">{event.subtitle || event.category || "Event"}</p>
          <h2 className="font-display text-[34px] font-bold leading-tight text-text">{event.title || "Untitled Event"}</h2>
          {event.tagline && <p className="text-[17px] text-dim">{event.tagline}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Avatar src={event.organizerLogo} size={52} alt={event.organizerName ?? ""} />
          <div className="flex flex-col">
            <span className="text-[20px] font-semibold text-text">{event.organizerName ?? "Organizer"}</span>
            <Rating value={event.organizerRating ?? 4.6} count={event.organizerRatingCount ?? "3k+"} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[19px] font-semibold text-text">{detailsLabel}</h3>
          <p className="text-[15px] leading-relaxed text-muted">
            {shown}
            {long && (
              <button type="button" onClick={() => setExpanded((v) => !v)} className="font-medium text-accent hover:underline">
                {expanded ? "Show Less" : "Read More.."}
              </button>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-[19px] font-semibold text-text">Choose Ticket Type</h3>
          {tickets.length === 0 ? (
            <p className="rounded-[24px] bg-surface-2 px-6 py-6 text-sm text-dim">No ticket types yet.</p>
          ) : (
            tickets.map((t, i) => (
              <TicketTypeCard
                key={t.id}
                ticket={t}
                highlighted={i === 0}
                onEdit={onEditTicket ? () => onEditTicket(t) : undefined}
                onDelete={onDeleteTicket ? () => onDeleteTicket(t) : undefined}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-[19px] font-semibold text-text">Attendees</h3>
          <div className="flex items-center gap-4">
            <AvatarGroup srcs={AVATARS} size={36} />
            <span className="text-[15px] text-text">{event.guests ?? 50}+ Guestlist</span>
          </div>
          <div className="flex items-center gap-4">
            <IconCircle>
              <IconCalendarSolid size={22} />
            </IconCircle>
            <div className="flex flex-col text-[15px] text-text">
              <span>{formatDateRange(event.startDate, event.endDate)}</span>
              <span>{event.startTime ? formatTime12(event.startTime) : "Time to be announced"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <IconCircle>
              <IconPin size={22} />
            </IconCircle>
            <span className="text-[15px] text-text">{event.venue || "Venue to be announced"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-[19px] font-semibold text-text">Location</h3>
          {/* Figma: pin + address + orange ✕ once set; the search field only while no address is chosen */}
          {onLocationChange && !event.location?.address ? (
            <LocationInput value={null} onChange={onLocationChange} placeholder="Enter Location" />
          ) : (
            <div className="flex items-center gap-3 px-2">
              <IconPin size={22} className="shrink-0 text-accent" />
              <span className="line-clamp-2 min-w-0 flex-1 text-[16px] text-text" title={event.location?.address}>{event.location?.address || "No address set"}</span>
              {onLocationChange && (
                <button
                  type="button"
                  onClick={() => onLocationChange(null)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:brightness-110"
                  aria-label="Clear location"
                  title="Change location"
                >
                  <IconClose size={12} />
                </button>
              )}
            </div>
          )}
          <div className="relative">
            <MapView
              lat={event.location?.lat}
              lng={event.location?.lng}
              address={event.location?.address || [event.venue, event.location?.city, event.location?.country].filter(Boolean).join(", ")}
              className={onLocationChange ? "h-[210px]" : "h-[170px]"}
              label={event.venue}
              interactive={!!onLocationChange}
              zoomControl={false}
              onPick={onLocationChange ? onPickOnMap : undefined}
            />
            {onUseMyLocation && (
              <button
                type="button"
                onClick={onUseMyLocation}
                className="absolute bottom-3 right-3 z-[1000] grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-[0_8px_24px_rgba(255,106,0,0.45)] transition hover:brightness-110"
                aria-label="Use my current location"
                title="Use my current location"
              >
                <IconPin size={22} />
              </button>
            )}
          </div>
        </div>

        {rightExtra}
        {footer && <div className="flex flex-wrap items-center justify-end gap-3 pt-2">{footer}</div>}
      </div>
    </div>
  );
}
