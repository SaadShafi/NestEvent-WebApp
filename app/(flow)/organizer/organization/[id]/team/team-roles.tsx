"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AVATARS } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { TeamMember } from "@/lib/types";
import { cn, isEmail, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, PhoneInput } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { MediaThumb, PhotoGuidelineTile, UploadZone } from "@/components/ui/uploader";
import { useToast } from "@/components/ui/toast";
import { IconClose, IconGrid, IconUser } from "@/components/ui/icons";
import { ROLE_SUBTITLE, TeamCard } from "../../../_components/team-card";

const ROLES: { value: TeamMember["role"]; icon: typeof IconUser }[] = [
  { value: "Event Manager", icon: IconUser },
  { value: "Door Manager", icon: IconGrid },
];

export function TeamRoles({ id }: { id: string }) {
  const hydrated = useNest((s) => s.hydrated);
  const org = useNest((s) => s.organizations.find((o) => o.id === id));

  return (
    <FlowPage title="Back" backHref="/organizer/organization/new" width="sm">
      {!hydrated ? (
        <p className="text-dim">Loading…</p>
      ) : !org ? (
        <p className="text-text">Organization not found.</p>
      ) : (
        <TeamForm id={id} initialTeam={org.team ?? []} />
      )}
    </FlowPage>
  );
}

function TeamForm({ id, initialTeam }: { id: string; initialTeam: TeamMember[] }) {
  const router = useRouter();
  const toast = useToast();
  const updateOrganization = useNest((s) => s.updateOrganization);

  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+1");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<TeamMember["role"] | null>("Event Manager");

  const addMember = () => {
    if (!name.trim()) return toast("Enter the point of contact name", "error");
    if (!isEmail(email)) return toast("Enter a valid email address", "error");
    if (!phone.trim()) return toast("Enter a phone number", "error");
    if (!role) return toast("Select a role", "error");
    const member: TeamMember = {
      id: uid("tm"),
      name: name.trim(),
      email: email.trim(),
      phone: `${dial} ${phone.trim()}`,
      role,
      avatar: avatar ?? AVATARS[team.length % AVATARS.length],
    };
    setTeam((t) => [...t, member]);
    setName("");
    setEmail("");
    setPhone("");
    setAvatar(undefined);
    setRole("Event Manager");
    toast(`${member.name} added to the team`, "success");
  };

  const save = () => {
    updateOrganization(id, { team });
    toast("Team saved", "success");
    router.push(`/organizer/organization/${id}/details`);
  };

  return (
    <div className="flex flex-col gap-6">
      <DisplayTitle sub="Point of contact and team assignment.">Team & Roles</DisplayTitle>

      <div className="flex items-center gap-3">
        {avatar ? (
          <MediaThumb src={avatar} size={110} onRemove={() => setAvatar(undefined)} />
        ) : (
          <UploadZone
            multiple={false}
            accept="image/*"
            className="!h-[110px] !w-[110px] !rounded-[18px] !p-0"
            onUploaded={(files) => files[0] && setAvatar(files[0].url)}
          >
            <span className="text-center text-[11px] leading-tight text-muted">
              Upload
              <br />
              Photo
            </span>
          </UploadZone>
        )}
        <PhotoGuidelineTile size={110} />
      </div>

      <Field label="Point Of Contact">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
      </Field>
      <Field label="Email Address">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
      </Field>
      <Field label="Phone Number">
        <PhoneInput value={phone} onChange={setPhone} dial={dial} onDialChange={setDial} />
      </Field>

      <Field label="Select Their Role">
        <div className="flex flex-col gap-3">
          {ROLES.map((r) => {
            const active = role === r.value;
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(active ? null : r.value)}
                className={cn(
                  "flex h-[62px] items-center gap-3 rounded-full px-2.5 pr-5 text-left transition",
                  active ? "bg-accent-gradient text-white" : "bg-surface-2 text-text hover:bg-surface-3",
                )}
              >
                <span className={cn("grid h-11 w-11 place-items-center rounded-full", active ? "bg-white/20" : "bg-surface")}>
                  <Icon size={22} />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[16px] font-semibold">{r.value}</span>
                  <span className={cn("text-xs", active ? "text-white/85" : "text-dim")}>{ROLE_SUBTITLE[r.value]}</span>
                </span>
                {active && <IconClose size={14} />}
              </button>
            );
          })}
        </div>
      </Field>

      <button
        type="button"
        onClick={addMember}
        className="h-13 rounded-full border border-accent text-[15px] font-semibold text-accent transition hover:bg-accent/10"
      >
        + Add team member
      </button>

      <div className="flex flex-col gap-3">
        <h3 className="text-[15px] font-medium text-text">Team List</h3>
        {team.length === 0 ? (
          <p className="rounded-[24px] bg-surface-2 px-5 py-5 text-sm text-dim">No team members yet. Fill the form above and add one.</p>
        ) : (
          team.map((m) => <TeamCard key={m.id} member={m} onDelete={() => setTeam((t) => t.filter((x) => x.id !== m.id))} />)
        )}
      </div>

      <Button variant="white" block onClick={save} className="mt-2">
        Save & Continue
      </Button>
    </div>
  );
}
