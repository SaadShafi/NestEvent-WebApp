"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNest } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { FlowPage } from "@/components/shell/flow-layout";
import { Avatar } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconEdit, IconPin, IconVerified } from "@/components/ui/icons";
import { TeamCard } from "../../../_components/team-card";

const FALLBACK_COVER = "/images/posters/crowd.jpg";

export function OrganizationDetails({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const hydrated = useNest((s) => s.hydrated);
  const org = useNest((s) => s.organizations.find((o) => o.id === id));
  const updateOrganization = useNest((s) => s.updateOrganization);

  if (!hydrated) {
    return (
      <FlowPage title="Details" backHref={`/organizer/organization/${id}/team`} width="lg">
        <p className="text-dim">Loading…</p>
      </FlowPage>
    );
  }
  if (!org) {
    return (
      <FlowPage title="Details" backHref="/organizer/organization/new" width="lg">
        <p className="text-text">Organization not found.</p>
      </FlowPage>
    );
  }

  const cover = org.cover ?? FALLBACK_COVER;
  const team = org.team ?? [];
  const locationText = org.location?.address || [org.location?.city, org.location?.country].filter(Boolean).join(", ");

  return (
    <FlowPage title="Details" backHref={`/organizer/organization/${id}/team`} width="lg">
      <div className="flex flex-col gap-8">
        <div className="relative h-[250px] w-full overflow-hidden rounded-[28px] bg-surface-2">
          <Image src={cover} alt="" fill sizes="900px" className="object-cover" unoptimized={cover.startsWith("/uploads")} />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="rounded-full border border-dashed border-[#5a5a5a] p-1">
              <Avatar src={org.logo} size={100} alt={org.name} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-2 font-display text-[28px] font-bold text-text">
                {org.name}
                {org.verified !== false && <IconVerified size={22} className="text-accent" />}
              </span>
              <span className="text-[15px] text-muted">{org.type}</span>
              {locationText && (
                <span className="inline-flex items-center gap-1 text-[15px] text-text">
                  <IconPin size={16} className="text-accent" />
                  {locationText}
                </span>
              )}
            </div>
          </div>
          <Button variant="white" size="sm" href="/organizer/organization/new" icon={<IconEdit size={15} />}>
            Edit Profile
          </Button>
        </div>

        {org.description && <p className="max-w-[560px] text-[15px] leading-relaxed text-text">{org.description}</p>}

        <div className="flex flex-col gap-4">
          <h3 className="text-[20px] font-semibold text-text">Team List</h3>
          {team.length === 0 ? (
            <p className="rounded-[24px] bg-surface-2 px-5 py-5 text-sm text-dim">No team members added yet.</p>
          ) : (
            team.map((m) => (
              <TeamCard
                key={m.id}
                member={m}
                large
                onDelete={() => {
                  updateOrganization(id, { team: team.filter((x) => x.id !== m.id) });
                  toast(`${m.name} removed`, "info");
                }}
              />
            ))
          )}
        </div>

        <Button variant="white" block className="mt-2 max-w-[560px]" onClick={() => router.push("/organizer/organization/success")}>
          Save & Continue
        </Button>
      </div>
    </FlowPage>
  );
}
