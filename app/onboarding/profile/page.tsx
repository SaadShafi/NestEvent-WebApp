"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/form";
import { IconInstagram, IconPlus, IconSnapchat, IconX, IconYoutube } from "@/components/ui/icons";
import { LocationInput } from "@/components/ui/location-input";
import { DisplayTitle, Spinner } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { MediaThumb, PhotoGuidelineTile } from "@/components/ui/uploader";
import { useNest } from "@/lib/store";
import type { LocationValue, SocialLinks } from "@/lib/types";
import { uploadFiles } from "@/lib/utils";

type SocialKey = keyof SocialLinks;

const SOCIALS: { key: SocialKey; label: string; icon: ReactNode }[] = [
  { key: "instagram", label: "Instagram", icon: <IconInstagram size={22} /> },
  { key: "x", label: "X", icon: <IconX size={22} /> },
  { key: "youtube", label: "YouTube", icon: <IconYoutube size={22} /> },
  { key: "snapchat", label: "Snapchat", icon: <IconSnapchat size={22} /> },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useNest((s) => s.user);
  const updateUser = useNest((s) => s.updateUser);
  const setOnboarded = useNest((s) => s.setOnboarded);

  const [avatar, setAvatar] = useState<string>("");
  const [avatarType, setAvatarType] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [social, setSocial] = useState<SocialLinks>({});
  const [enabled, setEnabled] = useState<Record<SocialKey, boolean>>({ instagram: false, x: false, youtube: false, snapchat: false });
  const [showSocial, setShowSocial] = useState(true);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  // prefill from the account created at sign-up
  useEffect(() => {
    if (!user) return;
    // Prefill the form from the persisted user once hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName((v) => v || `${user.firstName} ${user.lastName}`.trim());
    setBio((v) => v || user.bio || "");
    if (user.avatar) setAvatar((v) => v || user.avatar!);
    if (user.social) {
      setSocial(user.social);
      setEnabled({
        instagram: !!user.social.instagram,
        x: !!user.social.x,
        youtube: !!user.social.youtube,
        snapchat: !!user.social.snapchat,
      });
    }
    if (user.location) {
      setLocation(user.location);
      setCountry(user.location.country ?? "");
      setCity(user.location.city ?? "");
      setZipcode(user.location.zipcode ?? "");
    }
  }, [user]);

  const pickFile = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const [f] = await uploadFiles([files[0]]);
      if (f) {
        setAvatar(f.url);
        setAvatarType(f.type);
        toast("Photo uploaded", "success");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onLocation = (v: LocationValue | null) => {
    setLocation(v);
    if (v) {
      if (v.country) setCountry(v.country);
      if (v.city) setCity(v.city);
      if (v.zipcode) setZipcode(v.zipcode);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrors({ name: "Display name is required" });
      return;
    }
    setErrors({});
    const [firstName, ...rest] = displayName.trim().split(/\s+/);
    const links: SocialLinks = {};
    SOCIALS.forEach(({ key }) => {
      const v = social[key]?.trim();
      if (enabled[key] && v) links[key] = v;
    });
    updateUser({
      firstName,
      lastName: rest.join(" ") || (user?.lastName ?? ""),
      bio: bio.trim(),
      avatar: avatar || user?.avatar,
      social: links,
      location: {
        address: location?.address ?? [city, country].filter(Boolean).join(", "),
        lat: location?.lat,
        lng: location?.lng,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        zipcode: zipcode.trim() || undefined,
      },
    });
    setOnboarded(true);
    toast("You're all set!", "success");
    router.push("/dashboard");
  };

  return (
    <FlowPage title="Back" backHref="/onboarding/interests" width="sm">
      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        <DisplayTitle sub="Add your photo or Short Videos that recognize identity">Profile Setup</DisplayTitle>

        <div className="flex items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => pickFile(e.target.files)} />
          {avatar ? (
            <MediaThumb src={avatar} type={avatarType} size={120} onRemove={() => setAvatar("")} />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-[120px] w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#5a5a5a] bg-[#111] text-center transition hover:border-accent disabled:opacity-60"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#5a5a5a] text-text">
                {uploading ? <Spinner className="h-4 w-4" /> : <IconPlus size={16} />}
              </span>
              <span className="text-[11px] text-muted">{uploading ? "Uploading…" : "Upload Photo"}</span>
            </button>
          )}
          <PhotoGuidelineTile size={120} />
        </div>

        <Field label="Display Name" error={errors.name}>
          <Input placeholder="Enter" value={displayName} onChange={(e) => setDisplayName(e.target.value)} invalid={!!errors.name} />
        </Field>

        <Field label="Bio">
          <Textarea placeholder="Write A Bio" value={bio} max={200} onChange={(e) => setBio(e.target.value)} />
        </Field>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-text">
              Add Social Media <span className="font-normal text-muted">(Optional)</span>
            </p>
            <button type="button" onClick={() => setShowSocial((v) => !v)} className="text-[13px] text-text hover:text-accent">
              {showSocial ? "− Hide" : "+ Add"}
            </button>
          </div>
          {showSocial &&
            SOCIALS.map(({ key, label, icon }) => (
              <div key={key} className="flex h-[56px] items-center gap-3 rounded-full bg-surface pl-3 pr-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center">{icon}</span>
                <input
                  type="url"
                  placeholder="Enter URL"
                  aria-label={`${label} URL`}
                  value={social[key] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSocial((s) => ({ ...s, [key]: v }));
                    if (v && !enabled[key]) setEnabled((en) => ({ ...en, [key]: true }));
                  }}
                  className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-text placeholder:text-dim"
                />
                <Toggle checked={enabled[key]} onChange={(v) => setEnabled((en) => ({ ...en, [key]: v }))} label={`Show ${label}`} />
              </div>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Country">
            <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" />
          </Field>
          <Field label="City">
            <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
          </Field>
        </div>

        <Field label="Location">
          <LocationInput value={location} onChange={onLocation} placeholder="Enter Location" />
        </Field>

        <Field label="Zipcode">
          <Input placeholder="Enter" value={zipcode} onChange={(e) => setZipcode(e.target.value)} inputMode="numeric" autoComplete="postal-code" />
        </Field>

        <Button type="submit" variant="white" block className="mt-4">
          Save &amp; Continue
        </Button>
      </form>
    </FlowPage>
  );
}
