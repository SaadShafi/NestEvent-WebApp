"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { Select, Toggle } from "@/components/ui/form";
import { IconClose, IconEdit, IconPlus, IconUser } from "@/components/ui/icons";
import { LocationInput } from "@/components/ui/location-input";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { MediaThumb, UploadZone, type UploadedFile } from "@/components/ui/uploader";
import { useNest } from "@/lib/store";
import type { LocationValue } from "@/lib/types";
import { uploadFiles } from "@/lib/utils";

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-dim">Loading…</div>}>
      <CreatePost />
    </Suspense>
  );
}

function CreatePost() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const toast = useToast();
  const user = useNest((s) => s.user);
  const events = useNest((s) => s.events);
  const addPost = useNest((s) => s.addPost);

  const [step, setStep] = useState<1 | 2>(1);
  const [media, setMedia] = useState<UploadedFile[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [eventId, setEventId] = useState("");
  const [busy, setBusy] = useState(false);
  const moreRef = useRef<HTMLInputElement>(null);

  const liveEvents = events.filter((e) => e.status !== "past");
  const chosenEvent = liveEvents.find((e) => e.id === eventId) ?? (verified ? liveEvents[0] : undefined);

  const addMore = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      const up = await uploadFiles(list);
      setMedia((m) => [...m, ...up]);
      toast(`${up.length} file${up.length > 1 ? "s" : ""} added`, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
      if (moreRef.current) moreRef.current.value = "";
    }
  };

  const confirm = () => {
    if (!user) return;
    if (!media.length) {
      toast("Add at least one photo or video", "error");
      return;
    }
    const text = caption.trim() || (chosenEvent ? chosenEvent.title : "New post");
    addPost({
      authorId: user.id,
      authorName: `${user.firstName} ${user.lastName}`.trim(),
      authorAvatar: user.avatar,
      title: text.slice(0, 40),
      caption: text,
      media: media.map((m) => ({ url: m.url, type: m.type.startsWith("video") ? "video" : "image" })),
      isPublic,
      location: location?.address,
      eventId: verified ? chosenEvent?.id : undefined,
      verifiedEvent: verified && !!chosenEvent,
    });
    toast("Post published", "success");
    router.push("/social");
  };

  if (step === 1) {
    return (
      <FlowPage title="Back" backHref="/social" width="lg">
        <DisplayTitle sub="reader will be distracted by the readable content">Create Post</DisplayTitle>
        <div className="mt-8">
          <UploadZone
            variant="large"
            title="Add Media"
            subtitle="Photos & Videos"
            multiple
            accept="image/*,video/*"
            onUploaded={(files) => setMedia((m) => [...m, ...files])}
          />
        </div>
        {media.length > 0 && (
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {media.map((m, i) => (
              <MediaThumb key={m.url + i} src={m.url} type={m.type} size={110} onRemove={() => setMedia((list) => list.filter((_, j) => j !== i))} />
            ))}
          </div>
        )}
        <Button variant="white" block size="lg" className="mt-10" disabled={media.length === 0} onClick={() => setStep(2)}>
          Continue
        </Button>
      </FlowPage>
    );
  }

  return (
    <FlowPage title="Back" backHref="/social" width="lg">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-border py-4">
          <IconEdit size={22} className="shrink-0 text-accent" />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            className="h-8 flex-1 bg-transparent text-[15px] text-text placeholder:text-muted"
            maxLength={500}
          />
        </div>
        <div className="border-b border-border py-2">
          <LocationInput value={location} onChange={setLocation} placeholder="Add Location" icon="search" className="[&>div]:bg-transparent [&>div]:pl-1" />
        </div>
      </div>

      <div className="mt-6 flex h-13 items-center gap-3 rounded-full bg-surface pl-1.5 pr-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2a1a0c] text-accent">
          <IconUser size={20} />
        </span>
        <span className="flex-1 text-[15px] text-text">{isPublic ? "Public" : "Private"}</span>
        <Toggle checked={isPublic} onChange={setIsPublic} label="Public" />
      </div>

      {verified && (
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-sm font-medium text-text">Attach event</p>
          <Select
            value={chosenEvent?.id ?? ""}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Select an event"
            options={liveEvents.map((e) => ({ value: e.id, label: e.title }))}
          />
          {chosenEvent && (
            <div className="mt-2">
              <EventCard event={chosenEvent} />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {media.map((m, i) => (
          <div key={m.url + i} className="relative h-[160px] w-[120px] shrink-0 overflow-hidden rounded-[18px] bg-surface">
            {m.type.startsWith("video") ? (
              <video src={m.url} className="h-full w-full object-cover" muted />
            ) : (
              <Image src={m.url} alt="" fill sizes="120px" className="object-cover" unoptimized />
            )}
            <button
              type="button"
              onClick={() => setMedia((list) => list.filter((_, j) => j !== i))}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white"
              aria-label="Remove"
            >
              <IconClose size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => moreRef.current?.click()}
          disabled={busy}
          className="grid h-[160px] w-[60px] shrink-0 place-items-center text-text transition hover:text-accent disabled:opacity-50"
          aria-label="Add more media"
        >
          <span className="grid h-8 w-8 place-items-center rounded-[8px] border-2 border-current">
            <IconPlus size={16} />
          </span>
        </button>
        <input ref={moreRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => addMore(e.target.files)} />
      </div>

      <Button variant="white" block size="lg" className="mt-8" onClick={confirm} loading={busy}>
        Confirm &amp; Upload
      </Button>
    </FlowPage>
  );
}
