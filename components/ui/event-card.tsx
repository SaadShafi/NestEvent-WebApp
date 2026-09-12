"use client";

import Image from "next/image";
import Link from "next/link";
import { AVATARS, formatEventDate, money } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconCalendar, IconHeart } from "./icons";
import { AvatarGroup } from "./primitives";

export function EventCard({
  event,
  href,
  className,
  compact,
}: {
  event: EventItem;
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  const fav = useNest((s) => s.favorites.includes(event.id));
  const toggle = useNest((s) => s.toggleFavorite);
  return (
    <Link
      href={href ?? `/events/${event.id}`}
      className={cn(
        "group relative flex shrink-0 flex-col overflow-hidden rounded-[28px] bg-surface-2 transition hover:-translate-y-0.5",
        compact ? "w-[250px]" : "w-[320px]",
        className,
      )}
    >
      <div className={cn("relative", compact ? "h-[210px]" : "h-[240px]")}>
        <Image src={event.cover} alt="" fill sizes="400px" className="scale-125 object-cover blur-2xl opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-2/90" />
        <div className="absolute inset-x-0 top-4 flex justify-center">
          <span className={cn("relative overflow-hidden rounded-[10px] shadow-2xl", compact ? "h-[170px] w-[125px]" : "h-[200px] w-[150px]")}>
            <Image src={event.cover} alt={event.title} fill sizes="200px" className="object-cover" />
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(event.id);
          }}
          className={cn(
            "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/30 backdrop-blur transition",
            fav ? "text-accent" : "text-white hover:text-accent",
          )}
          aria-label="Favorite"
        >
          <IconHeart size={18} filled={fav} />
        </button>
        <span className="absolute bottom-3 left-4 rounded-full bg-black/60 px-3 py-1 text-xs text-text backdrop-blur">{event.category}</span>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4 pt-1">
        <div className="flex items-center gap-2">
          <AvatarGroup srcs={AVATARS} size={26} />
          <span className="text-xs text-muted">{event.guests} + Guests</span>
        </div>
        <p className={cn("line-clamp-1 font-medium text-text", compact ? "text-[15px]" : "text-[17px]")}>{event.title}</p>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <IconCalendar size={16} />
            {formatEventDate(event)}
          </span>
          <span className="text-[17px] font-semibold text-text">{money(event.price)}</span>
        </div>
      </div>
    </Link>
  );
}
