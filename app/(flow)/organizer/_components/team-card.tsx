"use client";

import type { TeamMember } from "@/lib/types";
import { Avatar } from "@/components/ui/primitives";
import { IconMail, IconPhone, IconTrash } from "@/components/ui/icons";

export const ROLE_SUBTITLE: Record<TeamMember["role"], string> = {
  "Event Manager": "Events · Guests · Marketing",
  "Door Manager": "Guest list · Scanner",
};

/** Subtitle on the large (Details) card — Figma: "Guest list · Scanner" for door staff, the role name otherwise. */
const CARD_SUBTITLE: Record<TeamMember["role"], string> = {
  "Event Manager": "Event Manager",
  "Door Manager": ROLE_SUBTITLE["Door Manager"],
};

export function TeamCard({ member, onDelete, large }: { member: TeamMember; onDelete?: () => void; large?: boolean }) {
  return (
    <div className={large ? "flex flex-col gap-6 rounded-[32px] bg-surface px-5 py-5 sm:gap-8 sm:px-[26px] sm:py-[22px]" : "flex flex-col gap-3 rounded-[20px] bg-surface-2 p-3.5"}>
      <div className={large ? "flex items-start gap-4" : "flex items-center gap-3"}>
        <Avatar src={member.avatar} size={large ? 64 : 44} alt={member.name} className={large ? "max-sm:!h-[52px] max-sm:!w-[52px]" : undefined} />
        <div className={large ? "flex min-w-0 flex-1 flex-col gap-0.5 pt-1" : "flex min-w-0 flex-1 flex-col"}>
          <span className={large ? "truncate text-[20px] font-semibold text-text sm:text-[24px]" : "text-[16px] font-semibold text-text"}>{member.name}</span>
          <span className={large ? "text-[15px] text-text/90 sm:text-[17px]" : "text-xs text-muted"}>{large ? CARD_SUBTITLE[member.role] : member.role}</span>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${member.name}`}
            className={large ? "inline-flex shrink-0 items-center gap-1.5 pt-1 text-[15px] text-danger hover:underline sm:text-[17px]" : "inline-flex items-center gap-1.5 text-sm text-danger hover:underline"}
          >
            <IconTrash size={large ? 20 : 16} />
            {/* phones: icon only, so long names keep their room */}
            <span className={large ? "max-sm:sr-only" : undefined}>Delete</span>
          </button>
        )}
      </div>
      <div className={large ? "flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-text sm:text-[17px]" : "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text"}>
        <span className="inline-flex shrink-0 items-center gap-2.5">
          <IconPhone size={large ? 20 : 13} className="text-accent" />
          {member.phone}
        </span>
        <span className="inline-flex min-w-0 items-center gap-2.5">
          <IconMail size={large ? 20 : 13} className="shrink-0 text-accent" />
          <span className="truncate">{member.email}</span>
        </span>
      </div>
    </div>
  );
}
