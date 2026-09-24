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

        {/* Figma: Edit Profile belongs to the name / type / location block — right edge, bottom-aligned with the location line */}
        <div className="flex items-center gap-4">
          <span className="shrink-0 rounded-full border border-dashed border-[#5a5a5a] p-1">
            <Avatar src={org.logo} size={84} alt={org.name} className="sm:!h-[100px] sm:!w-[100px]" />
          </span>
          {/* Button stays on the right of the name/address column whenever that column is wide enough (container
              query, not viewport — the column is narrow on tablets); long addresses wrap inside their own column. */}
          <div className="@container min-w-0 flex-1">
            <div className="flex flex-col gap-3 @min-[480px]:flex-row @min-[480px]:items-end @min-[480px]:justify-between @min-[480px]:gap-6">
              <div className="flex min-w-0 flex-col gap-0.5 @min-[480px]:flex-1">
                <span className="inline-flex flex-wrap items-center gap-2 break-words font-display text-[24px] font-bold text-text sm:text-[28px]">
                  {org.name}
                  {org.verified !== false && <IconVerified size={22} className="text-accent" />}
                </span>
                <span className="text-[15px] text-muted">{org.type}</span>
                {locationText && (
                  <span className="flex items-start gap-1 text-[15px] text-text" title={locationText}>
                    <IconPin size={16} className="mt-[3px] shrink-0 text-accent" />
                    <span className="line-clamp-2 min-w-0">{locationText}</span>
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                href="/organizer/organization/new"
                icon={<IconEdit size={16} />}
                className="h-9! shrink-0 self-start px-4! text-[15px]! font-medium! @min-[480px]:self-auto"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {org.description && <p className="max-w-[560px] text-[15px] leading-relaxed text-text">{org.description}</p>}

        <div className="flex max-w-[545px] flex-col gap-5">
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

        <Button variant="white" block className="mt-2 max-w-[545px]" onClick={() => router.push("/organizer/organization/success")}>
          Save & Continue
        </Button>
      </div>
    </FlowPage>
  );
}
