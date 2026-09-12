"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/form";
import { IconInstagram, IconSnapchat, IconX, IconYoutube } from "@/components/ui/icons";
import { LocationInput } from "@/components/ui/location-input";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { MediaThumb, PhotoGuidelineTile } from "@/components/ui/uploader";
import { useNest } from "@/lib/store";
import type { LocationValue, SocialLinks, User } from "@/lib/types";
import { uploadFiles } from "@/lib/utils";

type SocialKey = keyof SocialLinks;

const SOCIALS: { key: SocialKey; label: string; icon: React.ReactNode; bg: string }[] = [
  { key: "instagram", label: "Instagram", icon: <IconInstagram size={14} />, bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
  { key: "x", label: "X", icon: <IconX size={13} />, bg: "bg-[#0d0d0d] border border-border" },
  { key: "youtube", label: "YouTube", icon: <IconYoutube size={15} />, bg: "bg-[#ff0000]" },
  { key: "snapchat", label: "Snapchat", icon: <IconSnapchat size={14} />, bg: "bg-[#fffc00]" },
];

export default function EditProfilePage() {
  const user = useNest((s) => s.user);
  return (
    <FlowPage title="Back" backHref="/account" width="sm">
      {user && <EditForm key={user.id} user={user} />}
    </FlowPage>
  );
}

function EditForm({ user }: { user: User }) {
  const router = useRouter();
  const toast = useToast();
  const updateUser = useNest((s) => s.updateUser);

  const [avatar, setAvatar] = useState<string | undefined>(user.avatar);
  const [name, setName] = useState(`${user.firstName} ${user.lastName}`.trim());
  const [bio, setBio] = useState(user.bio ?? "");
  const [social, setSocial] = useState<SocialLinks>(user.social ?? {});
  const [enabled, setEnabled] = useState<Record<SocialKey, boolean>>({
    instagram: !!user.social?.instagram,
    x: !!user.social?.x,
    youtube: !!user.social?.youtube,
    snapchat: !!user.social?.snapchat,
  });
  const [visibleRows, setVisibleRows] = useState(4);
  const [country, setCountry] = useState(user.location?.country ?? "");
  const [city, setCity] = useState(user.location?.city ?? "");
  const [location, setLocation] = useState<LocationValue | null>(user.location ?? null);
  const [zip, setZip] = useState(user.location?.zipcode ?? "");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickAvatar = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      const [f] = await uploadFiles(list);
      if (f) {
        setAvatar(f.url);
        toast("Photo uploaded", "success");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Display name is required", "error");
      return;
    }
    setSaving(true);
    const [firstName, ...rest] = trimmed.split(/\s+/);
    const links: SocialLinks = {};
    (Object.keys(enabled) as SocialKey[]).forEach((k) => {
      if (enabled[k] && social[k]?.trim()) links[k] = social[k]!.trim();
    });
    updateUser({
      firstName,
      lastName: rest.join(" "),
      bio,
      avatar,
      social: links,
      location: {
        address: location?.address || [city, country].filter(Boolean).join(", "),
        lat: location?.lat,
        lng: location?.lng,
        city: city || location?.city,
        country: country || location?.country,
        zipcode: zip || location?.zipcode,
      },
    });
    toast("Profile updated", "success");
    router.push("/account");
  };

  return (
    <>
      <DisplayTitle sub="Add your photo or Short Videos that recognize identity">Edit Profile</DisplayTitle>

      <div className="mt-6 flex items-center gap-3">
        {avatar ? (
          <MediaThumb src={avatar} size={120} onRemove={() => setAvatar(undefined)} />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-[18px] border border-dashed border-accent bg-[#111] text-sm text-muted hover:text-text"
          >
            {busy ? "Uploading…" : "+ Photo"}
          </button>
        )}
        <button type="button" onClick={() => fileRef.current?.click()} className="text-left" aria-label="Upload new photo">
          <PhotoGuidelineTile size={120} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickAvatar(e.target.files)} />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <Field label="Display Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter" />
        </Field>
        <Field label="Bio">
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write A Bio" max={200} />
        </Field>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-text">
              Add Social Media <span className="font-normal text-muted">(Optional)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                if (visibleRows < SOCIALS.length) setVisibleRows(SOCIALS.length);
                else toast("All social networks are listed", "info");
              }}
              className="text-[13px] font-medium text-text hover:text-accent"
            >
              + Add
            </button>
          </div>
          {SOCIALS.slice(0, visibleRows).map((s) => (
            <div key={s.key} className="flex h-13 items-center gap-3 rounded-full bg-surface pl-4 pr-3">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${s.bg}`}>{s.icon}</span>
              <input
                value={social[s.key] ?? ""}
                onChange={(e) => setSocial((v) => ({ ...v, [s.key]: e.target.value }))}
                onFocus={() => setEnabled((v) => ({ ...v, [s.key]: true }))}
                placeholder="Enter URL"
                className="h-full flex-1 bg-transparent text-[14px] text-text placeholder:text-muted"
                aria-label={`${s.label} URL`}
              />
              <Toggle checked={enabled[s.key]} onChange={(v) => setEnabled((e) => ({ ...e, [s.key]: v }))} label={`Show ${s.label}`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Country">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
          </Field>
          <Field label="City">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </Field>
        </div>
        <Field label="Location">
          <LocationInput
            value={location}
            onChange={(v) => {
              setLocation(v);
              if (v?.country) setCountry(v.country);
              if (v?.city) setCity(v.city);
              if (v?.zipcode) setZip(v.zipcode);
            }}
            placeholder="Enter Location"
          />
        </Field>
        <Field label="Zipcode">
          <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Enter" inputMode="numeric" />
        </Field>

        <Button variant="white" block className="mt-4" onClick={save} loading={saving}>
          Save &amp; Continue
        </Button>
      </div>
    </>
  );
}
