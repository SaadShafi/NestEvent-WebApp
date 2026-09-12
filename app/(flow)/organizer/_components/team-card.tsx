"use client";

import type { TeamMember } from "@/lib/types";
import { Avatar } from "@/components/ui/primitives";
import { IconMail, IconPhone, IconTrash } from "@/components/ui/icons";

export const ROLE_SUBTITLE: Record<TeamMember["role"], string> = {
  "Event Manager": "Events · Guests · Marketing",
  "Door Manager": "Guest list · Scanner",
};

export function TeamCard({ member, onDelete, large }: { member: TeamMember; onDelete?: () => void; large?: boolean }) {
  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-surface-2 p-5">
      <div className="flex items-start gap-3">
        <Avatar src={member.avatar} size={large ? 60 : 44} alt={member.name} />
        <div className="flex flex-1 flex-col">
          <span className={large ? "text-[22px] font-semibold text-text" : "text-[16px] font-semibold text-text"}>{member.name}</span>
          <span className={large ? "text-[15px] text-muted" : "text-xs text-muted"}>
            {large ? ROLE_SUBTITLE[member.role] : member.role}
          </span>
        </div>
        {onDelete && (
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline">
            <IconTrash size={16} />
            Delete
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-5 text-sm text-text">
        <span className="inline-flex items-center gap-2">
          <IconPhone size={16} className="text-accent" />
          {member.phone}
        </span>
        <span className="inline-flex items-center gap-2">
          <IconMail size={16} className="text-accent" />
          {member.email}
        </span>
      </div>
    </div>
  );
}
