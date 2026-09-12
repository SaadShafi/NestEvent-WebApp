"use client";

import { useMemo, useState } from "react";
import { PEOPLE } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FlowPage } from "@/components/shell/flow-layout";
import { Avatar } from "@/components/ui/primitives";

const REACTIONS = ["👋", "❤️", "🥳", "👍"] as const;

interface Attendee {
  id: string;
  name: string;
  avatar: string;
}

export function Attendees({ id }: { id: string }) {
  const list = useMemo<Attendee[]>(() => {
    const pool = PEOPLE.filter((p) => p.avatar.includes("/avatars/"));
    return Array.from({ length: 24 }, (_, i) => {
      const p = pool[i % pool.length];
      return { id: `${id}-att-${i}`, name: p.name, avatar: p.avatar };
    });
  }, [id]);

  const [counts, setCounts] = useState<Record<string, number>>({});
  const bump = (attendeeId: string, emoji: string) => {
    const key = `${attendeeId}:${emoji}`;
    setCounts((c) => ({ ...c, [key]: (c[key] ?? 0) + 1 }));
  };

  return (
    <FlowPage title="Back" backHref={`/organizer/events/${id}`} width="full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {list.map((a) => (
          <div key={a.id} className="flex flex-col items-center gap-2 rounded-[18px] bg-surface-2 p-3">
            <Avatar src={a.avatar} size={64} alt={a.name} />
            <span className="text-[11px] text-text">{a.name}</span>
            <div className="flex items-center gap-1">
              {REACTIONS.map((r) => {
                const n = counts[`${a.id}:${r}`] ?? 0;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => bump(a.id, r)}
                    className={cn(
                      "relative grid h-7 w-7 place-items-center rounded-full text-base transition hover:scale-110 hover:bg-surface",
                      n > 0 && "bg-surface",
                    )}
                    aria-label={`React ${r} to ${a.name}`}
                  >
                    {r}
                    {n > 0 && (
                      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                        {n}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </FlowPage>
  );
}
