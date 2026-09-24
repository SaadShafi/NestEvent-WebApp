"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNest } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  IconBell,
  IconChevronDown,
  IconDashboard,
  IconEvents,
  IconLogout,
  IconMessage,
  IconSearch,
  IconSocial,
  IconTicket,
  IconUser,
  IconPlus,
} from "@/components/ui/icons";
import { Avatar } from "@/components/ui/primitives";
import { NestLogo } from "@/components/ui/nest-logo";
import { LocationInput } from "@/components/ui/location-input";
import { CreateMenu } from "@/components/shell/create-menu";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard, roles: ["guest", "organizer"] },
  { href: "/search", label: "Search", icon: IconSearch, roles: ["guest", "organizer"] },
  { href: "/social", label: "Social", icon: IconSocial, roles: ["guest", "organizer"] },
  { href: "/tickets", label: "My Tickets", icon: IconTicket, roles: ["guest", "organizer"] },
  { href: "/organizer/events", label: "My Events", icon: IconEvents, roles: ["organizer"] },
  { href: "/messages", label: "Messages", icon: IconMessage, roles: ["guest", "organizer"] },
  { href: "/account", label: "Account", icon: IconUser, roles: ["guest", "organizer"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut, hydrated, notifications, markNotificationsRead, currentLocation, setCurrentLocation } = useNest();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !user) router.replace("/auth/role");
  }, [hydrated, user, router]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
      if (locRef.current && !locRef.current.contains(t)) setLocOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Close the mobile drawer whenever the route changes (derived-state pattern).
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setMobileNav(false);
  }

  if (!hydrated || !user) {
    return <div className="grid min-h-screen place-items-center text-dim">Loading…</div>;
  }

  const unread = notifications.filter((n) => !n.read).length;
  const nav = NAV.filter((n) => n.roles.includes(role));

  const sidebar = (
    <aside className="flex h-full w-[var(--sidebar-w)] max-w-[85vw] flex-col justify-between overflow-y-auto bg-bg px-6 pb-8 pt-3">
      <nav className="flex flex-col gap-2">
        {nav.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex h-[52px] items-center gap-3 rounded-[14px] px-4 text-[16px] transition",
                active ? "bg-surface font-semibold text-text" : "text-muted hover:bg-surface/60 hover:text-text",
              )}
            >
              <Icon size={22} />
              {n.label}
            </Link>
          );
        })}
        {/* Create popup: Post / verified event post (+ event & organization for organizers) */}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="mt-2 flex h-[52px] items-center gap-3 rounded-[14px] bg-accent-gradient px-4 text-[16px] font-semibold text-white"
        >
          <IconPlus size={20} /> Create
        </button>
      </nav>
      <button
        type="button"
        onClick={() => {
          signOut();
          router.push("/auth/role");
        }}
        className="flex h-[52px] items-center gap-3 rounded-[14px] bg-[#1a120c] px-5 text-sm font-medium text-accent transition hover:bg-[#241810]"
      >
        <IconLogout size={18} /> Log-Out
      </button>
    </aside>
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* 3-column grid with equal flexible sides: the search field sits in the centre of the header. */}
      <header className="sticky top-0 z-40 flex h-[var(--topbar-h)] shrink-0 items-center gap-3 bg-bg md:grid md:grid-cols-[minmax(max-content,1fr)_minmax(200px,min(520px,calc(100vw-920px)))_minmax(max-content,1fr)] md:gap-6">
        {/* Logo cell lines up with the sidebar; the only divider line sits under the logo. */}
        <div className="flex h-full shrink-0 items-center gap-3 pl-4 md:w-[var(--sidebar-w)] md:justify-self-start md:border-b md:border-border md:px-6">
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface md:hidden" onClick={() => setMobileNav((v) => !v)} aria-label="Menu">
            <span className="block h-0.5 w-5 bg-text shadow-[0_-6px_0_#fcfcfc,0_6px_0_#fcfcfc]" />
          </button>
          <Link href="/dashboard" aria-label="Nest home" className="shrink-0">
            <NestLogo priority className="h-10 md:h-14" />
          </Link>
        </div>
        <form
          className="hidden w-full items-center gap-3 rounded-full bg-surface px-5 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <IconSearch size={18} className="shrink-0 text-text" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Name, Date"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-dim"
          />
        </form>
        <div className="ml-auto flex items-center justify-end gap-2 pr-4 sm:gap-3 md:ml-0 md:justify-self-end md:pr-8 xl:gap-5">
          <div ref={locRef} className="relative">
            <button
              type="button"
              onClick={() => setLocOpen((v) => !v)}
              className="hidden h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold text-text lg:flex xl:px-5"
            >
              <span className="max-w-[110px] truncate xl:max-w-[160px]">{currentLocation || "Select Location"}</span>
              <IconChevronDown size={16} />
            </button>
            {locOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[min(380px,calc(100vw-32px))] rounded-[24px] border border-border bg-[#141414] p-4 shadow-2xl">
                <p className="mb-3 text-sm font-medium text-text">Your location</p>
                <LocationInput
                  value={currentLocation ? { address: currentLocation } : null}
                  onChange={(v) => {
                    setCurrentLocation(v?.address ?? "");
                    if (v) setLocOpen(false);
                  }}
                  placeholder="City, area or address"
                />
              </div>
            )}
          </div>
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v);
                if (!notifOpen) markNotificationsRead();
              }}
              className="relative grid h-11 w-11 place-items-center rounded-full text-text hover:bg-surface"
              aria-label="Notifications"
            >
              <IconBell size={22} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute -right-12 top-[calc(100%+8px)] w-[min(340px,calc(100vw-32px))] rounded-[24px] border border-border bg-[#141414] p-3 shadow-2xl sm:right-0">
                <p className="px-2 pb-2 text-sm font-semibold text-text">Notifications</p>
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-[14px] px-3 py-2.5 text-sm text-muted hover:bg-surface">
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div ref={userRef} className="relative">
            <button type="button" onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-2">
              <Avatar src={user.avatar} size={40} alt={user.firstName} />
              <span className="hidden max-w-[140px] truncate text-sm text-text xl:block">
                {user.firstName} {user.lastName}
              </span>
              <IconChevronDown size={16} className="hidden text-text md:block" />
            </button>
            {userOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-[20px] border border-border bg-[#141414] p-2 shadow-2xl">
                <Link href="/account" className="block rounded-[12px] px-3 py-2.5 text-sm text-text hover:bg-surface">
                  Profile
                </Link>
                <Link href="/settings" className="block rounded-[12px] px-3 py-2.5 text-sm text-text hover:bg-surface">
                  Settings
                </Link>
                {/* the location pill is hidden in the header below lg — reachable from here instead */}
                <button
                  type="button"
                  onClick={() => {
                    setUserOpen(false);
                    setLocOpen(true);
                  }}
                  className="block w-full truncate rounded-[12px] px-3 py-2.5 text-left text-sm text-text hover:bg-surface lg:hidden"
                >
                  {currentLocation ? `Location: ${currentLocation}` : "Select Location"}
                </button>
                <Link href="/auth/role" className="block rounded-[12px] px-3 py-2.5 text-sm text-text hover:bg-surface">
                  Switch role ({role})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.push("/auth/role");
                  }}
                  className="block w-full rounded-[12px] px-3 py-2.5 text-left text-sm text-accent hover:bg-surface"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <div className="sticky top-[var(--topbar-h)] hidden h-[calc(100vh-var(--topbar-h))] md:block">{sidebar}</div>
        {mobileNav && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNav(false)} />
            <div className="absolute left-0 top-[var(--topbar-h)] h-[calc(100vh-var(--topbar-h))]">{sidebar}</div>
          </div>
        )}
        <main className="min-w-0 flex-1 px-4 pb-16 pt-8 md:px-6 md:pb-20 lg:px-8">{children}</main>
      </div>
      <CreateMenu open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
