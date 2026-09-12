"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNest } from "@/lib/store";
import { cn, uid } from "@/lib/utils";
import { IconBuilding, IconCalendar, IconCheckCircle, IconGrid, IconImage } from "@/components/ui/icons";
import { Modal } from "@/components/ui/primitives";

const OPTIONS = [
  { key: "post", label: "Post", icon: IconImage, href: "/social/create-post", roles: ["guest", "organizer"] },
  { key: "verified", label: "Create verified event post", icon: IconGrid, href: "/social/create-post?verified=1", roles: ["guest", "organizer"] },
  { key: "event", label: "Create Event", icon: IconCalendar, href: "/organizer/events/new/details", roles: ["organizer"] },
  { key: "org", label: "Create Organizer", icon: IconBuilding, href: "/organizer/organization/new", roles: ["organizer"] },
];

/** "Create" chooser modal — matches the Figma Create dialog. */
export function CreateMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const role = useNest((s) => s.role);
  const setDraft = useNest((s) => s.setDraft);
  const [sel, setSel] = useState<string>(role === "organizer" ? "event" : "post");
  const options = OPTIONS.filter((o) => o.roles.includes(role));

  const go = (key: string) => {
    const o = options.find((x) => x.key === key)!;
    setSel(key);
    if (key === "event") setDraft({ id: uid("draft"), step: 1 });
    onClose();
    router.push(o.href);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create" className="max-w-[460px]">
      <div className="flex flex-col gap-3">
        {options.map((o) => {
          const Icon = o.icon;
          const active = sel === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => go(o.key)}
              className={cn(
                "flex h-16 items-center gap-3 rounded-full px-5 text-left text-[15px] font-medium transition",
                active ? "bg-accent-gradient text-white" : "bg-surface text-text hover:bg-surface-3",
              )}
            >
              <Icon size={24} />
              <span className="flex-1">{o.label}</span>
              {active && <IconCheckCircle size={22} className="text-success" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
