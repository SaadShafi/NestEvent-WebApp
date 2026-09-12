"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Avatar, Stars } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  IconEdit,
  IconInstagram,
  IconPin,
  IconPlay,
  IconShare,
  IconSnapchat,
  IconVerified,
  IconX,
  IconYoutube,
} from "@/components/ui/icons";
import { PEOPLE, compact } from "@/lib/data";
import { useNest } from "@/lib/store";
import { copyText } from "@/lib/utils";

export default function AccountPage() {
  const user = useNest((s) => s.user);
  const posts = useNest((s) => s.posts);
  const toast = useToast();

  const gallery = useMemo(() => {
    const mine = posts.filter((p) => p.authorId === user?.id).flatMap((p) => p.media.map((m) => ({ url: m.url, type: m.type, postId: p.id })));
    const fallback = (PEOPLE[0].gallery ?? []).map((url) => ({ url, type: "image" as const, postId: undefined as string | undefined }));
    return [...mine, ...fallback].slice(0, 9);
  }, [posts, user?.id]);

  if (!user) return null;

  const share = async () => {
    const url = `${window.location.origin}/users/${user.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${user.firstName} ${user.lastName}`, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    const ok = await copyText(url);
    toast(ok ? "Profile link copied" : "Could not copy link", ok ? "success" : "error");
  };

  const openSocial = (key: "instagram" | "x" | "youtube" | "snapchat") => {
    const link = user.social?.[key];
    if (link) {
      window.open(link.startsWith("http") ? link : `https://${link}`, "_blank", "noopener");
    } else {
      toast(`No ${key === "x" ? "X" : key[0].toUpperCase() + key.slice(1)} link yet — add one in Edit Profile`, "info");
    }
  };

  const stats = user.stats ?? { posts: 0, followers: 0, followings: 0 };

  return (
    <div className="mx-auto max-w-[1000px]">
      {/* cover */}
      <div className="relative h-[300px] overflow-hidden rounded-[28px] bg-surface-2">
        {user.cover && <Image src={user.cover} alt="" fill sizes="1000px" className="object-cover" unoptimized={user.cover.startsWith("/uploads")} priority />}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button type="button" onClick={share} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/70 px-3 text-xs font-medium text-white backdrop-blur hover:bg-black/85">
            <IconShare size={13} /> Share
          </button>
          <Link href="/account/edit" className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/70 px-3 text-xs font-medium text-white backdrop-blur hover:bg-black/85">
            <IconEdit size={13} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* identity */}
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-5">
          <Avatar src={user.avatar} alt={user.firstName} size={110} />
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-[26px] font-semibold leading-tight text-text">
              {user.firstName} {user.lastName}
              {user.verified && <IconVerified size={22} className="text-accent" />}
            </p>
            {user.title && <p className="text-[15px] text-muted">{user.title}</p>}
            <div className="flex flex-wrap items-center gap-3">
              {user.location?.address && (
                <span className="inline-flex items-center gap-1 text-sm text-text">
                  <IconPin size={15} className="text-accent" />
                  {user.location.address}
                </span>
              )}
              <Stars value={user.rating ?? 0} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:pt-6">
          <SocialCircle onClick={() => openSocial("instagram")} label="Instagram" className="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
            <IconInstagram size={16} />
          </SocialCircle>
          <SocialCircle onClick={() => openSocial("x")} label="X" className="bg-surface">
            <IconX size={15} />
          </SocialCircle>
          <SocialCircle onClick={() => openSocial("youtube")} label="YouTube" className="bg-[#ff0000]">
            <IconYoutube size={17} />
          </SocialCircle>
          <SocialCircle onClick={() => openSocial("snapchat")} label="Snapchat" className="bg-[#fffc00]">
            <IconSnapchat size={16} />
          </SocialCircle>
          <SocialCircle onClick={share} label="Share" className="bg-surface text-text">
            <IconShare size={15} />
          </SocialCircle>
        </div>
      </div>

      {user.bio && <p className="mt-5 text-[14px] leading-relaxed text-muted">{user.bio}</p>}

      {/* stats */}
      <div className="mt-5 inline-flex flex-wrap items-center gap-6 rounded-[20px] bg-surface-2 px-6 py-3">
        <Stat value={compact(stats.posts)} label="Posts" />
        <Link href="/account/friends?tab=followers" className="hover:opacity-80">
          <Stat value={compact(stats.followers)} label="Followers" />
        </Link>
        <Link href="/account/friends?tab=following" className="hover:opacity-80">
          <Stat value={compact(stats.followings)} label="Followings" />
        </Link>
        <Link href="/account/friends" className="ml-2 inline-flex h-13 items-center rounded-full bg-accent-gradient px-10 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(255,106,0,0.3)] hover:brightness-110">
          Friend list
        </Link>
      </div>

      {/* gallery */}
      <div className="mt-6 grid grid-cols-2 gap-4 pb-10 sm:grid-cols-3">
        {gallery.map((g, i) => {
          const inner = (
            <>
              {g.type === "video" ? (
                <video src={g.url} className="absolute inset-0 h-full w-full object-cover" muted />
              ) : (
                <Image src={g.url} alt="" fill sizes="320px" className="object-cover transition duration-300 group-hover:scale-105" unoptimized={g.url.startsWith("/uploads")} />
              )}
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-[17px] font-medium text-white drop-shadow">
                <IconPlay size={20} /> 5k
              </span>
            </>
          );
          const cls = "group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-surface-2";
          return g.postId ? (
            <Link key={g.url + i} href={`/social/post/${g.postId}/comments`} className={cls}>
              {inner}
            </Link>
          ) : (
            <Link key={g.url + i} href="/social" className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col items-center leading-tight">
      <span className="text-[22px] font-semibold text-text">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </span>
  );
}

function SocialCircle({ children, onClick, label, className }: { children: React.ReactNode; onClick: () => void; label: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`grid h-9 w-9 place-items-center rounded-full text-white transition hover:scale-105 ${className ?? ""}`}>
      {children}
    </button>
  );
}
