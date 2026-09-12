"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ORG_CATEGORIES, ORG_TYPES } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { LocationValue, Organization, SocialLinks } from "@/lib/types";
import { isEmail, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Chip, Field, Input, PhoneInput, Select, Textarea, Toggle } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle } from "@/components/ui/primitives";
import { LocationInput } from "@/components/ui/location-input";
import { MediaThumb, PhotoGuidelineTile, UploadZone } from "@/components/ui/uploader";
import { useToast } from "@/components/ui/toast";
import { IconInstagram, IconSnapchat, IconX, IconYoutube } from "@/components/ui/icons";

type SocialKey = keyof SocialLinks;

const SOCIALS: { key: SocialKey; icon: ReactNode; label: string }[] = [
  { key: "instagram", icon: <IconInstagram size={22} />, label: "Instagram" },
  { key: "x", icon: <IconX size={22} />, label: "X" },
  { key: "youtube", icon: <IconYoutube size={22} />, label: "YouTube" },
  { key: "snapchat", icon: <IconSnapchat size={22} />, label: "Snapchat" },
];

export default function CreateOrganizationPage() {
  const router = useRouter();
  const toast = useToast();
  const addOrganization = useNest((s) => s.addOrganization);

  const [cover, setCover] = useState<string | undefined>();
  const [logo, setLogo] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+1");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState<Record<SocialKey, { url: string; on: boolean }>>({
    instagram: { url: "", on: false },
    x: { url: "", on: false },
    youtube: { url: "", on: false },
    snapchat: { url: "", on: false },
  });
  const [socialRows, setSocialRows] = useState<SocialKey[]>(["instagram", "x", "youtube", "snapchat"]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCategory = (c: string) => setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const onLocation = (v: LocationValue | null) => {
    setLocation(v);
    if (v) {
      if (v.country) setCountry(v.country);
      if (v.city) setCity(v.city);
      if (v.zipcode) setZipcode(v.zipcode);
    }
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Organization name is required";
    if (!type) errs.type = "Choose an organization type";
    if (email && !isEmail(email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length) return toast("Please fix the highlighted fields", "error");

    const links: SocialLinks = {};
    (Object.keys(social) as SocialKey[]).forEach((k) => {
      if (social[k].on && social[k].url.trim()) links[k] = social[k].url.trim();
    });
    const org: Organization = {
      id: uid("org"),
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      categories,
      logo,
      cover,
      email: email.trim() || undefined,
      phone: phone ? `${dial} ${phone}` : undefined,
      social: links,
      location: { address: location?.address ?? [city, country].filter(Boolean).join(", "), lat: location?.lat, lng: location?.lng, country, city, zipcode },
      rating: 0,
      ratingCount: "0",
      followers: "0",
      verified: false,
      team: [],
      ownerId: "me",
    };
    addOrganization(org);
    toast("Organization saved", "success");
    router.push(`/organizer/organization/${org.id}/team`);
  };

  return (
    <FlowPage title="Back" backHref="/organizer/events" width="sm">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <DisplayTitle sub="Start organization inside existing account.">
          Create
          <br />
          Organization
        </DisplayTitle>

        {cover ? (
          <div className="relative h-[150px] overflow-hidden rounded-[28px] bg-surface">
            <Image src={cover} alt="" fill sizes="520px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => setCover(undefined)}
              className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-text"
            >
              Remove cover
            </button>
          </div>
        ) : (
          <UploadZone
            multiple={false}
            accept="image/*"
            title="Upload Files"
            subtitle="Upload profile Cover"
            buttonLabel="Upload"
            onUploaded={(files) => files[0] && setCover(files[0].url)}
          />
        )}

        <Field label="Profile Picture">
          <div className="flex items-center gap-3">
            {logo ? (
              <MediaThumb src={logo} size={90} onRemove={() => setLogo(undefined)} />
            ) : (
              <UploadZone
                multiple={false}
                accept="image/*"
                className="!h-[90px] !w-[90px] !rounded-[18px] !p-0"
                onUploaded={(files) => files[0] && setLogo(files[0].url)}
              >
                <span className="text-center text-[11px] leading-tight text-muted">
                  Upload
                  <br />
                  Logo
                </span>
              </UploadZone>
            )}
            <PhotoGuidelineTile size={90} />
          </div>
        </Field>

        <Field label="Organization Name" error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="NightBloom" invalid={!!errors.name} />
        </Field>

        <Field label="Organization Type" error={errors.type}>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Select type"
            options={ORG_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </Field>

        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} max={200} placeholder="Brand Bio And Purpose" />
        </Field>

        <Field label="Categories">
          <div className="flex flex-wrap gap-2">
            {ORG_CATEGORIES.map((c) => (
              <Chip key={c} active={categories.includes(c)} removable onClick={() => toggleCategory(c)} size="md">
                {c}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Email Address" error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" invalid={!!errors.email} />
        </Field>

        <Field label="Phone Number">
          <PhoneInput value={phone} onChange={setPhone} dial={dial} onDialChange={setDial} />
        </Field>

        <Field
          label="Add Social Media (Optional)"
          action={
            <button
              type="button"
              className="text-xs font-medium text-text hover:text-accent"
              onClick={() => {
                const missing = SOCIALS.map((s) => s.key).find((k) => !socialRows.includes(k));
                if (missing) setSocialRows((r) => [...r, missing]);
                else toast("All social networks are already listed", "info");
              }}
            >
              + Add
            </button>
          }
        >
          <div className="flex flex-col gap-3">
            {socialRows.map((k) => {
              const s = SOCIALS.find((x) => x.key === k)!;
              return (
                <div key={k} className="flex h-13 items-center gap-3 rounded-full bg-surface pl-4 pr-3">
                  <span className="shrink-0">{s.icon}</span>
                  <input
                    value={social[k].url}
                    onChange={(e) => setSocial((v) => ({ ...v, [k]: { ...v[k], url: e.target.value } }))}
                    placeholder="Enter URL"
                    aria-label={`${s.label} URL`}
                    className="h-full flex-1 bg-transparent text-sm text-text placeholder:text-dim"
                  />
                  <Toggle checked={social[k].on} onChange={(on) => setSocial((v) => ({ ...v, [k]: { ...v[k], on } }))} label={`Enable ${s.label}`} />
                </div>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
          </Field>
          <Field label="City">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </Field>
        </div>

        <Field label="Location">
          <LocationInput value={location} onChange={onLocation} placeholder="Enter Location" />
        </Field>

        <Field label="Zipcode">
          <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="Enter" />
        </Field>

        <Button type="submit" variant="white" size="md" block className="mt-2">
          Save & Continue
        </Button>
      </form>
    </FlowPage>
  );
}
