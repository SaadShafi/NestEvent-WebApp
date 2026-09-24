"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PillTabs } from "@/components/ui/form";
import { PageTitle, EmptyState } from "@/components/ui/primitives";
import { useNest } from "@/lib/store";
import type { Post } from "@/lib/types";
import { ReportModal } from "./_components/report-modal";
import { Reel } from "./_components/reel";

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <PageTitle className="lg:w-[200px] lg:shrink-0">Social</PageTitle>
        <div className="flex min-w-0 flex-1 justify-center lg:pr-[200px]">
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
        </div>
      )}

      <ReportModal post={report} open={!!report} onClose={() => setReport(null)} />
    </div>
  );
}
