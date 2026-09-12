"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PillTabs } from "@/components/ui/form";
import { PageTitle, Avatar, EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  IconBookmark,
  IconChevronDown,
  IconComment,
  IconDots,
  IconHeart,
  IconPlus,
  IconShare,
} from "@/components/ui/icons";
import { compact, formatEventDate } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { EventItem, Post } from "@/lib/types";
import { cn, copyText, timeAgo } from "@/lib/utils";
import { ReportModal } from "./_components/report-modal";

type Tab = "following" | "foryou";

/**
 * Social = vertical reels viewer. One post fills the viewer; mouse wheel,
 * trackpad, touch, arrow keys and the side chevrons move one reel at a time
 * (CSS scroll-snap). Videos autoplay only while visible.
 */
export default function SocialPage() {
  const [tab, setTab] = useState<Tab>("following");
  const posts = useNest((s) => s.posts);
  const following = useNest((s) => s.following);
  const user = useNest((s) => s.user);
  const [report, setReport] = useState<Post | null>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const feed = useMemo(() => {
    if (tab === "foryou") return posts;
    const mine = posts.filter((p) => following.includes(p.authorId) || p.authorId === user?.id);
    return mine.length ? mine : posts;
  }, [tab, posts, following, user?.id]);

  // Track which reel is in view.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reel]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActive(Number((e.target as HTMLElement).dataset.reel));
          }
        }
      },
      { root, threshold: [0.6] },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [feed]);

  // Reset to the first reel whenever the feed changes (tab switch).
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  const goTo = useCallback(
    (i: number) => {
      const root = scrollerRef.current;
      if (!root) return;
      const idx = Math.max(0, Math.min(feed.length - 1, i));
      const el = root.querySelector<HTMLElement>(`[data-reel="${idx}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [feed.length],
  );

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        goTo(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        goTo(active - 1);
      } else if (e.key === "m") {
        setMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  return (
    <div className="relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <PageTitle className="md:w-[200px] md:shrink-0">Social</PageTitle>
        <div className="flex flex-1 justify-center md:pr-[200px]">
          <PillTabs<Tab>
            className="w-full max-w-[460px]"
            tabs={[
              { value: "following", label: "Following" },
              { value: "foryou", label: "For You" },
            ]}
            value={tab}
            onChange={(v) => {
              setTab(v);
              setActive(0);
            }}
          />
        </div>
      </div>

      {feed.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No posts yet" sub="Follow people to see their posts here." />
        </div>
      ) : (
        <div className="relative mx-auto mt-6 flex w-full max-w-[560px] items-stretch justify-center gap-4">
          <div
            ref={scrollerRef}
            className="no-scrollbar h-[calc(100vh-var(--topbar-h)-150px)] min-h-[560px] w-full max-w-[480px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-[16px] bg-black [overflow-anchor:none]"
            aria-label="Reels"
          >
            {feed.map((p, i) => (
              <Reel
                key={p.id}
                index={i}
                post={p}
                isActive={i === active}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
                onReport={() => setReport(p)}
              />
            ))}
          </div>

          {/* side navigation */}
          <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex lg:-right-16">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              className="grid h-11 w-11 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-3 disabled:opacity-30"
              aria-label="Previous reel"
            >
              <IconChevronDown size={20} className="rotate-180" />
            </button>
            <span className="text-xs text-dim">
              {active + 1} / {feed.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active >= feed.length - 1}
              className="grid h-11 w-11 place-items-center rounded-full bg-surface text-text transition hover:bg-surface-3 disabled:opacity-30"
              aria-label="Next reel"
            >
              <IconChevronDown size={20} />
            </button>
          </div>
        </div>
      )}

      <Link
        href="/social/create-post"
        className="fixed bottom-8 right-8 z-30 grid h-16 w-16 place-items-center rounded-full bg-accent-gradient text-white shadow-[0_12px_30px_rgba(255,106,0,0.4)] transition hover:scale-105"
        aria-label="Create post"
      >
        <IconPlus size={26} />
      </Link>

      <ReportModal post={report} open={!!report} onClose={() => setReport(null)} />
    </div>
  );
}

function Reel({
  post,
  index,
  isActive,
  muted,
  onToggleMute,
  onReport,
}: {
  post: Post;
  index: number;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onReport: () => void;
}) {
  const liked = useNest((s) => s.likedPosts.includes(post.id));
  const saved = useNest((s) => s.savedPosts.includes(post.id));
  const isFollowing = useNest((s) => s.following.includes(post.authorId));
  const toggleLike = useNest((s) => s.toggleLike);
  const toggleSave = useNest((s) => s.toggleSave);
  const toggleFollow = useNest((s) => s.toggleFollow);
  const event = useNest((s) => (post.eventId ? s.events.find((e) => e.id === post.eventId) : undefined));
  const user = useNest((s) => s.user);
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [burst, setBurst] = useState(false);
  const [mediaIdx, setMediaIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef(0);
  const isMe = post.authorId === user?.id;
  const media = post.media[mediaIdx] ?? post.media[0];

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  // Autoplay only the visible reel.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [isActive, media?.url]);

  const share = async () => {
    const url = `${window.location.origin}/social/post/${post.id}/comments`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.caption, url });
        toast("Shared", "success");
        return;
      } catch {
        /* cancelled */
      }
    }
    const ok = await copyText(url);
    toast(ok ? "Link copied to clipboard" : "Could not copy link", ok ? "success" : "error");
  };

  const like = () => {
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }
    toggleLike(post.id);
  };

  // Double-tap / double-click on the media = like.
  const onMediaClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      if (!liked) like();
      else {
        setBurst(true);
        setTimeout(() => setBurst(false), 700);
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      if (media?.type === "video") {
        const v = videoRef.current;
        if (v) {
          if (v.paused) v.play().catch(() => {});
          else v.pause();
        }
      }
    }
  };

  return (
    <article
      data-reel={index}
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-surface-2"
    >
      <div className="absolute inset-0 cursor-pointer" onClick={onMediaClick} role="presentation">
        {media?.type === "video" ? (
          <video
            ref={videoRef}
            src={media.url}
            className="absolute inset-0 h-full w-full object-cover"
            muted={muted}
            loop
            playsInline
            preload="metadata"
          />
        ) : media ? (
          <Image
            src={media.url}
            alt={post.title}
            fill
            sizes="480px"
            className="object-cover"
            unoptimized={media.url.startsWith("/uploads") || media.url.startsWith("blob:")}
            priority={index === 0}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {burst && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[fade-in_0.2s_ease-out] text-[#ff2d55] drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            <IconHeart size={120} filled />
          </span>
        )}
      </div>

      {/* multi-media dots */}
      {post.media.length > 1 && (
        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1.5">
          {post.media.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMediaIdx(i)}
              className={cn("h-1.5 rounded-full transition-all", i === mediaIdx ? "w-6 bg-white" : "w-1.5 bg-white/50")}
              aria-label={`Media ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* top-right controls */}
      <div ref={menuRef} className="absolute right-4 top-4 z-20 flex items-center gap-2">
        {media?.type === "video" && (
          <button
            type="button"
            onClick={onToggleMute}
            className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <MutedIcon /> : <SoundIcon />}
          </button>
        )}
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
          aria-label="More"
        >
          <IconDots size={20} />
        </button>
        {menu && (
          <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-[14px] border border-border bg-[#141414] p-1 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setMenu(false);
                share();
              }}
              className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-text hover:bg-surface"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => {
                setMenu(false);
                toggleSave(post.id);
              }}
              className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-text hover:bg-surface"
            >
              {saved ? "Unsave" : "Save"}
            </button>
            {!isMe && (
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  onReport();
                }}
                className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-danger hover:bg-surface"
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>

      {/* action column */}
      <div className={cn("absolute right-4 z-20 flex flex-col items-center gap-3", event ? "bottom-[130px]" : "bottom-6")}>
        <ActionButton
          label={compact(post.likes)}
          onClick={like}
          active={liked}
          icon={<IconHeart size={22} filled={liked} className={liked ? "text-[#ff2d55]" : "text-white"} />}
        />
        <Link href={`/social/post/${post.id}/comments`} className="flex flex-col items-center gap-1">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70">
            <IconComment size={22} />
          </span>
          <span className="text-xs text-white">{compact(post.comments)}</span>
        </Link>
        <ActionButton label={compact(post.shares)} onClick={share} icon={<IconShare size={22} className="text-white" />} />
        <ActionButton
          label={compact(post.saves + (saved ? 1 : 0))}
          active={saved}
          onClick={() => {
            toggleSave(post.id);
            toast(saved ? "Removed from saved" : "Post saved", "success");
          }}
          icon={<IconBookmark size={22} filled={saved} className={saved ? "text-accent" : "text-white"} />}
        />
      </div>

      {/* bottom-left overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-5 [&>*]:pointer-events-auto">
        <div className="flex flex-col gap-2 pr-[72px]">
          <div className="flex items-center gap-3">
            <Link href={isMe ? "/account" : `/users/${post.authorId}`}>
              <Avatar src={post.authorAvatar} size={38} />
            </Link>
            <div className="leading-tight">
              <Link href={isMe ? "/account" : `/users/${post.authorId}`} className="text-[16px] font-semibold text-white">
                {post.authorName}
              </Link>
              <p className="text-xs text-white/70">{timeAgo(post.createdAt)}</p>
            </div>
            {!isMe && (
              <button
                type="button"
                onClick={() => {
                  toggleFollow(post.authorId);
                  toast(isFollowing ? `Unfollowed ${post.authorName}` : `Following ${post.authorName}`, "success");
                }}
                className={cn(
                  "ml-2 h-7 rounded-full border px-4 text-xs font-semibold transition",
                  isFollowing ? "border-accent bg-accent text-white" : "border-accent text-accent hover:bg-accent/10",
                )}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
          <p className="text-[18px] font-semibold text-white">{post.title}</p>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={cn("text-left text-[14px] leading-snug text-white/85", !expanded && "line-clamp-2")}
          >
            {post.caption}
            {post.location ? <span className="text-white/60"> · {post.location}</span> : null}
          </button>
        </div>
        {event && <EventStrip event={event} />}
      </div>
    </article>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-1">
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full bg-black/50 backdrop-blur transition group-hover:bg-black/70 group-active:scale-90",
          active && "ring-1 ring-white/20",
        )}
      >
        {icon}
      </span>
      <span className="text-xs text-white">{label}</span>
    </button>
  );
}

function EventStrip({ event }: { event: EventItem }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-[#0f0f0f]/95 p-2 pr-2 shadow-xl backdrop-blur">
      <span className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[12px]">
        <Image src={event.cover} alt="" fill sizes="70px" className="object-cover" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[17px] font-semibold text-text">{event.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{formatEventDate(event)}</p>
        <p className="truncate text-xs text-muted">
          {event.location.city ?? event.venue}
          {event.location.country ? `, ${event.location.country}` : ""}
        </p>
      </div>
      <Link
        href={`/events/${event.id}`}
        className="flex h-[64px] shrink-0 flex-col items-center justify-center rounded-[12px] bg-accent-gradient px-4 text-white shadow-[0_8px_20px_rgba(255,106,0,0.35)] transition hover:brightness-110"
      >
        <span className="text-[15px] font-semibold">Get Tickets</span>
        <span className="text-xs">From ${event.price}</span>
      </Link>
    </div>
  );
}

function MutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
