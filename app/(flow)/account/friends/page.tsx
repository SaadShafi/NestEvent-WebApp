"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { FlowPage } from "@/components/shell/flow-layout";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { PEOPLE, compact } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "followers" | "following" | "requests";

const TABS: { value: Tab; label: string }[] = [
  { value: "followers", label: "Followers" },
  { value: "following", label: "Following" },
  { value: "requests", label: "Follow Requests" },
];

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-dim">Loading…</div>}>
      <Friends />
    </Suspense>
  );
}

function personById(id: string): Person {
  return PEOPLE.find((p) => p.id === id) ?? { id, name: id.replace(/^u-/, "").replace(/-/g, " "), avatar: "/images/avatars/a3.png" };
}

function Friends() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const raw = params.get("tab");
  const tab: Tab = raw === "following" || raw === "requests" ? raw : "followers";

  const user = useNest((s) => s.user);
  const followers = useNest((s) => s.followers);
  const following = useNest((s) => s.following);
  const requests = useNest((s) => s.followRequests);
  const toggleFollow = useNest((s) => s.toggleFollow);
  const removeFollower = useNest((s) => s.removeFollower);
  const acceptRequest = useNest((s) => s.acceptRequest);
  const declineRequest = useNest((s) => s.declineRequest);

  const setTab = (t: Tab) => router.replace(`/account/friends?tab=${t}`);

  const list = useMemo(() => {
    const ids = tab === "followers" ? followers : tab === "following" ? following : requests;
    return ids.map(personById);
  }, [tab, followers, following, requests]);

  const stats = user?.stats;
  const count =
    tab === "followers"
      ? compact(Math.max(stats?.followers ?? 0, followers.length))
      : tab === "following"
        ? compact(Math.max(stats?.followings ?? 0, following.length))
        : String(requests.length);
  const countLabel = tab === "followers" ? "All Followers" : tab === "following" ? "All Following" : "Pending Requests";

  // Full-page screen (no sidebar / top bar), per Figma.
  return (
    <FlowPage title="Back" backHref="/account" width="lg">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-6">
          {TABS.map((t) => {
            const active = t.value === tab;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  "rounded-full transition",
                  active
                    ? "h-12 border border-border bg-surface-2 px-5 text-[18px] font-semibold text-text shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:h-16 sm:px-8 sm:text-[26px]"
                    : "px-3 text-[16px] text-text hover:text-accent sm:px-4 sm:text-[22px]",
                )}
              >
                {t.label}
                {t.value === "requests" && requests.length > 0 && !active && (
                  <span className="ml-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 align-middle text-xs font-semibold text-white">{requests.length}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 px-1 leading-tight sm:mt-10 sm:px-3">
          <p className="text-[28px] font-semibold text-text sm:text-[34px]">{count}</p>
          <p className="text-[20px] font-semibold text-text sm:text-[24px]">{countLabel}</p>
        </div>

        <div className="mt-6 max-w-[640px]">
          {list.length === 0 ? (
            <EmptyState title={tab === "requests" ? "No pending requests" : tab === "following" ? "You are not following anyone yet" : "No followers yet"} />
          ) : (
            list.map((p) => {
              const isFollowing = following.includes(p.id);
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border py-4 last:border-0 sm:flex-nowrap sm:gap-7 sm:py-5 sm:pl-3">
                  <Avatar src={p.avatar} alt={p.name} size={64} className="sm:!h-20 sm:!w-20" />
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-5">
                    <span className="max-w-full truncate text-[17px] font-semibold text-text sm:text-[20px]">{p.name}</span>
                    {tab !== "requests" && (
                      <button
                        type="button"
                        onClick={() => {
                          toggleFollow(p.id);
                          toast(isFollowing ? `Unfollowed ${p.name}` : `Following ${p.name}`, "success");
                        }}
                        className="shrink-0 text-[15px] font-semibold text-accent hover:brightness-110 sm:text-[18px]"
                      >
                        {tab === "following" ? "Unfollow" : isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  {tab === "followers" && (
                    <button
                      type="button"
                      onClick={() => {
                        removeFollower(p.id);
                        toast(`${p.name} removed from followers`, "success");
                      }}
                      className="h-10 shrink-0 rounded-full bg-surface px-5 text-[15px] text-text transition hover:bg-surface-3 sm:h-12 sm:px-7 sm:text-[17px]"
                    >
                      Remove
                    </button>
                  )}
                  {tab === "requests" && (
                    <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          acceptRequest(p.id);
                          toast(`${p.name} is now following you`, "success");
                        }}
                        className="h-11 flex-1 rounded-full bg-accent-gradient px-6 text-[15px] font-semibold text-white hover:brightness-110 sm:h-12 sm:flex-none sm:px-7 sm:text-[16px]"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          declineRequest(p.id);
                          toast("Request declined", "info");
                        }}
                        className="h-11 flex-1 rounded-full bg-surface px-6 text-[15px] text-text hover:bg-surface-3 sm:h-12 sm:flex-none sm:px-7 sm:text-[16px]"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </FlowPage>
  );
}
