"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { Avatar, BackHeader, EmptyState } from "@/components/ui/primitives";
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

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="flex flex-col gap-6 md:flex-row md:gap-12">
        <div className="shrink-0 md:w-[120px]">
          <BackHeader title="Back" href="/account" />
        </div>
        <div className="min-w-0 flex-1">
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
                      ? "h-16 border border-border bg-surface-2 px-8 text-[26px] font-semibold text-text shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                      : "px-4 text-[22px] text-text hover:text-accent",
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

          <div className="mt-10 px-3 leading-tight">
            <p className="text-[34px] font-semibold text-text">{count}</p>
            <p className="text-[24px] font-semibold text-text">{countLabel}</p>
          </div>

          <div className="mt-6 max-w-[640px]">
            {list.length === 0 ? (
              <EmptyState title={tab === "requests" ? "No pending requests" : tab === "following" ? "You are not following anyone yet" : "No followers yet"} />
            ) : (
              list.map((p) => {
                const isFollowing = following.includes(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-7 border-b border-border py-5 pl-3 last:border-0">
                    <Avatar src={p.avatar} alt={p.name} size={80} />
                    <div className="flex min-w-0 flex-1 items-center gap-5">
                      <span className="truncate text-[20px] font-semibold text-text">{p.name}</span>
                      {tab !== "requests" && (
                        <button
                          type="button"
                          onClick={() => {
                            toggleFollow(p.id);
                            toast(isFollowing ? `Unfollowed ${p.name}` : `Following ${p.name}`, "success");
                          }}
                          className="shrink-0 text-[18px] font-semibold text-accent hover:brightness-110"
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
                        className="h-12 shrink-0 rounded-full bg-surface px-7 text-[17px] text-text transition hover:bg-surface-3"
                      >
                        Remove
                      </button>
                    )}
                    {tab === "requests" && (
                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            acceptRequest(p.id);
                            toast(`${p.name} is now following you`, "success");
                          }}
                          className="h-12 rounded-full bg-accent-gradient px-7 text-[16px] font-semibold text-white hover:brightness-110"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            declineRequest(p.id);
                            toast("Request declined", "info");
                          }}
                          className="h-12 rounded-full bg-surface px-7 text-[16px] text-text hover:bg-surface-3"
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
      </div>
    </div>
  );
}
