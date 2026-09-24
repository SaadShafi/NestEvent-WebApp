"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNest } from "@/lib/store";
import type { EventItem, Post, SocialLinks } from "@/lib/types";
import { cn, copyText } from "@/lib/utils";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { PillTabs } from "@/components/ui/form";
import { IconInstagram, IconPin, IconPlay, IconShare, IconSnapchat, IconVerified, IconX, IconYoutube } from "@/components/ui/icons";
import { Avatar, EmptyState, Stars } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

export interface ProfileData {
  id: string;
  name: string;
  avatar?: string;
  cover?: string;
  verified?: boolean;
  title?: string;
  location?: string;
  rating?: number;
  bio?: string;
  stats: { posts: number; followers: string; followings: number };
  gallery: string[];
  social?: SocialLinks;
}

type Tab = "posts" | "events";

export function ProfileView({
  profile,
  events,
  backTitle = "Details",
  backHref = "/search",
}: {
  profile: ProfileData;
  events: EventItem[];
  backTitle?: string;
  backHref?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const following = useNest((s) => s.following.includes(profile.id));
  const toggleFollow = useNest((s) => s.toggleFollow);
  const startConversation = useNest((s) => s.startConversation);
  const ensurePost = useNest((s) => s.ensurePost);
  const [tab, setTab] = useState<Tab>("posts");

  // Gallery tiles are this profile's posts: open them in View Post (→ Comments / Report).
  const openPost = (src: string, i: number) => {
    const post = galleryPost(profile, src, i);
    ensurePost(post);
    router.push(`/social/post/${post.id}`);
  };

  const message = () => {
    const id = startConversation(profile.id, profile.name, profile.avatar);
    router.push(`/messages?c=${id}`);
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share({ title: profile.name, url });
        return;
      }
    } catch {
      /* cancelled */
      return;
    }
    const ok = await copyText(url);
    toast(ok ? "Profile link copied" : "Could not copy link", ok ? "success" : "error");
  };

  const socials: { key: keyof SocialLinks; icon: React.ReactNode; base: string; bg: string }[] = [
    { key: "instagram", icon: <IconInstagram size={16} />, base: "https://instagram.com/", bg: "bg-[#2a1a2e]" },
    { key: "x", icon: <IconX size={14} />, base: "https://x.com/", bg: "bg-[#1a1a1a]" },
    { key: "youtube", icon: <IconYoutube size={16} />, base: "https://youtube.com/@", bg: "bg-[#e52d27] text-white" },
    { key: "snapchat", icon: <IconSnapchat size={16} />, base: "https://snapchat.com/add/", bg: "bg-[#fffc00] text-black" },
  ];
  const handle = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return (
    <FlowPage title={backTitle} backHref={backHref} width="lg">
      <div className="flex flex-col gap-6">
        <div className="relative h-[260px] overflow-hidden rounded-[28px] bg-surface-2">
          <Image src={profile.cover ?? "/images/posters/crowd.jpg"} alt="" fill sizes="900px" className="object-cover" priority />
        </div>

        <div className="flex flex-col gap-5 px-2 md:px-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={profile.avatar} size={90} alt={profile.name} className="ring-2 ring-white/20" />
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-2 text-[22px] font-semibold text-text">
                  {profile.name}
                  {profile.verified && <IconVerified size={20} className="text-accent" />}
                </p>
                {profile.title && <p className="text-[14px] text-muted">{profile.title}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1 text-[13px] text-muted">
                      <IconPin size={14} className="text-accent" />
                      {profile.location}
                    </span>
                  )}
                  {profile.rating != null && <Stars value={profile.rating} />}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-center">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={profile.social?.[s.key] ?? `${s.base}${handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn("grid h-9 w-9 place-items-center rounded-full text-text transition hover:brightness-125", s.bg)}
                  aria-label={s.key}
                >
                  {s.icon}
                </a>
              ))}
              <button type="button" onClick={share} className="grid h-9 w-9 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-3" aria-label="Share profile">
                <IconShare size={16} />
              </button>
            </div>
          </div>

          {profile.bio && <p className="text-[14px] leading-relaxed text-muted">{profile.bio}</p>}

          <div className="inline-flex w-full flex-wrap items-center gap-2 rounded-[22px] bg-surface-2 p-2 pl-3 sm:w-fit">
            <StatCell value={String(profile.stats.posts)} label="Posts" />
            <StatCell value={profile.stats.followers} label="Followers" />
            <StatCell value={String(profile.stats.followings)} label="Followings" />
            {/* outline Follow button with an orange border (not the white outline variant) */}
            <button
              type="button"
              onClick={() => {
                toggleFollow(profile.id);
                toast(following ? `Unfollowed ${profile.name}` : `Following ${profile.name}`, "success");
              }}
              className={cn(
                "inline-flex h-13 min-w-[110px] items-center justify-center rounded-full border border-accent px-7 text-[15px] font-semibold transition hover:bg-accent/10 sm:ml-3",
                following ? "text-accent" : "text-text",
              )}
            >
              {following ? "Following" : "Follow"}
            </button>
            <Button size="md" onClick={message} className="min-w-[110px]">
              Message
            </Button>
          </div>

          <PillTabs<Tab>
            size="md"
            tabs={[
              { value: "posts", label: "Posts" },
              { value: "events", label: "Events" },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === "posts" &&
            (profile.gallery.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {profile.gallery.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => openPost(src, i)}
                    className="group relative aspect-[3/4] overflow-hidden rounded-[16px] bg-surface-2"
                    aria-label="Open post"
                  >
                    <Image src={src} alt="" fill sizes="300px" className="object-cover transition group-hover:scale-105" />
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-[16px] font-medium text-white drop-shadow">
                      <IconPlay size={18} /> 5k
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="No posts yet" />
            ))}

          {tab === "events" &&
            (events.length ? (
              <div className="flex flex-wrap gap-6">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} compact />
                ))}
              </div>
            ) : (
              <EmptyState title="No events yet" sub={`${profile.name} hasn't published any events.`} action={<Button href="/dashboard">Explore events</Button>} />
            ))}
        </div>
      </div>

    </FlowPage>
  );
}

/** A feed post for one of a profile's gallery tiles (stable id, so likes/comments stick). */
function galleryPost(profile: ProfileData, src: string, i: number): Post {
  return {
    id: `pv-${profile.id}-${i}`,
    authorId: profile.id,
    authorName: profile.name,
    authorAvatar: profile.avatar,
    createdAt: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
    title: profile.name,
    caption: profile.bio ?? profile.name,
    media: [{ url: src, type: /\.(mp4|webm|mov)$/i.test(src) ? "video" : "image" }],
    likes: 1200 + i * 137,
    comments: 0,
    shares: 40 + i * 7,
    saves: 25 + i * 5,
    location: profile.location,
  };
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center px-2">
      <span className="text-[18px] font-semibold text-text">{value}</span>
      <span className="text-[12px] text-muted">{label}</span>
    </div>
  );
}
