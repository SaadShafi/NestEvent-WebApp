"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/data";
import { useNest, type DraftEvent } from "@/lib/store";
import type { LocationValue } from "@/lib/types";
import { cn, uploadFiles } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle, Spinner } from "@/components/ui/primitives";
import { LocationInput } from "@/components/ui/location-input";
import { MediaThumb, UploadZone } from "@/components/ui/uploader";
import { useToast } from "@/components/ui/toast";
import { IconCalendar, IconCheckCircle, IconClock, IconGrid, IconImage } from "@/components/ui/icons";
import { useDraft, WIZARD } from "../_lib/use-draft";

export default function CreateEventDetailsPage() {
  const { draft, patch, ready } = useDraft();
  const isEdit = !!draft?.id.startsWith("ev-");
  return (
    <FlowPage title="Back" backHref={isEdit ? `/organizer/events/${draft?.id}` : "/organizer/events"} width="xl">
      {ready && draft ? <DetailsForm draft={draft} patch={patch} /> : <p className="text-dim">Loading…</p>}
    </FlowPage>
  );
}

function DetailsForm({ draft, patch }: { draft: DraftEvent; patch: (p: Partial<DraftEvent>) => void }) {
  const router = useRouter();
  const toast = useToast();
  const organizations = useNest((s) => s.organizations);
  const flyerInput = useRef<HTMLInputElement>(null);
  const [flyerBusy, setFlyerBusy] = useState(false);

  const [gallery, setGallery] = useState<string[]>(draft.gallery ?? []);
  const [title, setTitle] = useState(draft.title ?? "");
  const [organizationId, setOrganizationId] = useState(draft.organizationId ?? organizations[0]?.id ?? "");
  const [category, setCategory] = useState(draft.category ?? "");
  const [tagline, setTagline] = useState(draft.tagline ?? "");
  const [startDate, setStartDate] = useState(draft.startDate ?? "");
  const [endDate, setEndDate] = useState(draft.endDate ?? "");
  const [startTime, setStartTime] = useState(draft.startTime ?? "22:00");
  const [endTime, setEndTime] = useState(draft.endTime ?? "04:00");
  const [venue, setVenue] = useState(draft.venue ?? "");
  const [location, setLocation] = useState<LocationValue | null>(draft.location?.address ? draft.location : null);
  const [country, setCountry] = useState(draft.location?.country ?? "");
  const [city, setCity] = useState(draft.location?.city ?? "");
  const [zipcode, setZipcode] = useState(draft.location?.zipcode ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onLocation = (v: LocationValue | null) => {
    setLocation(v);
    if (v) {
      if (v.country) setCountry(v.country);
      if (v.city) setCity(v.city);
      if (v.zipcode) setZipcode(v.zipcode);
    }
  };

  const uploadFlyer = async (files: FileList | null) => {
    if (!files?.length) return;
    setFlyerBusy(true);
    try {
      const [f] = await uploadFiles(files);
      if (f) {
        patch({ flyer: f.url, cover: f.url });
        toast("Flyer uploaded", "success");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setFlyerBusy(false);
      if (flyerInput.current) flyerInput.current.value = "";
    }
  };

  const collect = (): Partial<DraftEvent> => {
    const org = organizations.find((o) => o.id === organizationId);
    return {
      title: title.trim(),
      organizationId,
      organizerName: org?.name,
      organizerLogo: org?.logo,
      organizerRating: org?.rating,
      organizerRatingCount: org?.ratingCount,
      category,
      subtitle: category ? `${category} Event` : draft.subtitle,
      tagline: tagline.trim(),
      startDate,
      endDate: endDate || startDate,
      startTime,
      endTime,
      venue: venue.trim(),
      gallery,
      cover: draft.cover ?? gallery[0],
      location: {
        address: location?.address ?? [venue, city, country].filter(Boolean).join(", "),
        lat: location?.lat,
        lng: location?.lng,
        country,
        city,
        zipcode,
      },
    };
  };

  const next = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Event name is required";
    if (!startDate) errs.startDate = "Start date is required";
    if (endDate && startDate && endDate < startDate) errs.endDate = "End date must be after the start date";
    setErrors(errs);
    if (Object.keys(errs).length) return toast("Please fix the highlighted fields", "error");
    patch({ ...collect(), step: 2 });
    router.push(WIZARD.eventDetails);
  };

  const goAi = () => {
    patch(collect());
    router.push(WIZARD.aiFlyer);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <form
        className="flex w-full max-w-[520px] flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <DisplayTitle sub="Event identity and organizer">Create Event</DisplayTitle>

        <UploadZone
          multiple
          accept="image/*,video/*"
          title="Upload Event Photo"
          subtitle=""
          buttonLabel="Upload"
          onUploaded={(files) => setGallery((g) => [...g, ...files.map((f) => f.url)])}
        />
        {gallery.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {gallery.map((src) => (
              <MediaThumb key={src} src={src} size={120} onRemove={() => setGallery((g) => g.filter((x) => x !== src))} />
            ))}
          </div>
        )}

        <Field label="Event Name" error={errors.title}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Midnight Garden" invalid={!!errors.title} />
        </Field>

        <Field label="Organization">
          <Select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            placeholder="Select organization"
            options={organizations.map((o) => ({ value: o.id, label: o.name }))}
          />
        </Field>

        <Field label="Category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Select category"
            options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </Field>

        <Field label="Short Tagline">
          <Textarea value={tagline} onChange={(e) => setTagline(e.target.value)} max={100} placeholder="Brand Bio And Purpose" />
        </Field>

        <h3 className="text-[20px] font-semibold text-text">Date, Time & Location</h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" error={errors.startDate}>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="[color-scheme:dark]" right={<IconCalendar size={18} />} invalid={!!errors.startDate} />
          </Field>
          <Field label="End Date" error={errors.endDate}>
            <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className="[color-scheme:dark]" right={<IconCalendar size={18} />} invalid={!!errors.endDate} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time">
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="[color-scheme:dark]" right={<IconClock size={18} />} />
          </Field>
          <Field label="End Time">
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="[color-scheme:dark]" right={<IconClock size={18} />} />
          </Field>
        </div>

        <Field label="Venue Name">
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Garden Hall" />
        </Field>

        <Field label="Location">
          <LocationInput value={location} onChange={onLocation} placeholder="Enter Location" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country">
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
          </Field>
          <Field label="City">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </Field>
        </div>

        <Field label="Zipcode">
          <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="Enter" />
        </Field>

        <Button type="submit" variant="white" block className="mt-2">
          Next
        </Button>
      </form>

      <aside className="w-full max-w-[300px] shrink-0 lg:sticky lg:top-12 lg:mt-24">
        <div className="flex flex-col gap-3 rounded-[24px] bg-surface-2 p-4">
          <h3 className="text-sm font-semibold text-text">Event Media & Flyer</h3>
          <input ref={flyerInput} type="file" accept="image/*" className="hidden" onChange={(e) => uploadFlyer(e.target.files)} />
          <button
            type="button"
            onClick={() => flyerInput.current?.click()}
            className="flex h-12 items-center gap-2.5 rounded-full bg-accent-gradient px-4 text-left text-xs font-semibold text-white transition hover:brightness-110"
          >
            {flyerBusy ? <Spinner className="h-4 w-4 border-white" /> : <IconImage size={18} />}
            <span className="flex-1">{draft.flyer ? "Flyer uploaded · replace" : "Upload flyer"}</span>
            {draft.flyer && <IconCheckCircle size={20} className="text-success" />}
          </button>
          <button
            type="button"
            onClick={goAi}
            className={cn("flex h-12 items-center gap-2.5 rounded-full bg-surface px-4 text-left text-xs font-semibold text-text transition hover:bg-surface-3")}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-3">
              <IconGrid size={14} />
            </span>
            Use AI assistant
          </button>
          {draft.flyer && (
            <MediaThumb src={draft.flyer} size={120} className="mt-1 self-center" onRemove={() => patch({ flyer: undefined, cover: gallery[0] })} />
          )}
        </div>
      </aside>
    </div>
  );
}
