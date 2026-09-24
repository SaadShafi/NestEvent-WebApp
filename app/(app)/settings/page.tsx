"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput } from "@/components/ui/form";
import { IconCard, IconChevronDown, IconDoc, IconLock, IconMail, IconMessage, IconTeam, IconTrash, IconWallet } from "@/components/ui/icons";
import { Modal, PageTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useNest } from "@/lib/store";
import { BankAccountsPanel, WalletPanel } from "./_components/wallet-panels";
import { cn, strongPassword } from "@/lib/utils";

type Tab = "password" | "terms" | "bank" | "wallet" | "privacy" | "faq" | "support" | "delete";
const TAB_VALUES: Tab[] = ["password", "terms", "bank", "wallet", "privacy", "faq", "support", "delete"];

// Figma order; Bank Accounts + Wallet are organizer-only panels.
const ITEMS: { value: Tab; label: string; icon: ReactNode; organizer?: boolean }[] = [
  { value: "password", label: "Change Password", icon: <IconLock size={16} /> },
  { value: "terms", label: "Terms & Conditions", icon: <IconDoc size={16} /> },
  { value: "bank", label: "Bank Accounts", icon: <IconCard size={16} />, organizer: true },
  { value: "wallet", label: "Wallet", icon: <IconWallet size={16} />, organizer: true },
  { value: "privacy", label: "Privacy Policy", icon: <IconDoc size={16} /> },
  { value: "faq", label: "FAQ", icon: <IconDoc size={16} /> },
  { value: "support", label: "Support", icon: <IconMessage size={16} /> },
];

const LOREM =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

const SUPPORT_EMAIL = "Support@starmagic.com";

const FAQS = [
  { q: "How do I buy a ticket?", a: "Open any event, tap Buy Ticket, choose your ticket type and quantity, then complete checkout. Your QR ticket appears under My Tickets." },
  { q: "Can I get a refund?", a: "Refund policies are set by each organizer. Check the event details page or contact the organizer from the event screen." },
  { q: "How do I become an organizer?", a: "Go to Settings and tap Become Organizer. You can then create an organization and publish events." },
  { q: "How do I transfer a ticket?", a: "Open the ticket from My Tickets and use Share Via to send the QR code to a friend." },
  { q: "Is my payment information safe?", a: "Payments are processed by our PCI-compliant partner. NEST never stores your full card number." },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-dim">Loading…</div>}>
      <Settings />
    </Suspense>
  );
}

function Settings() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("tab") as Tab | null;
  const role = useNest((s) => s.role);
  const allowed = (t: Tab) => TAB_VALUES.includes(t) && (role === "organizer" || (t !== "bank" && t !== "wallet"));
  const tab: Tab = raw && allowed(raw) ? raw : "password";
  const setTab = (t: Tab) => router.replace(`/settings?tab=${t}`);

  const setRole = useNest((s) => s.setRole);
  const updateUser = useNest((s) => s.updateUser);
  const toast = useToast();

  const becomeOrganizer = () => {
    setRole("organizer");
    updateUser({ role: "organizer" });
    toast("Organizer mode enabled", "success");
    router.push("/organizer/events");
  };

  return (
    <div className="max-w-[1040px]">
      <PageTitle>Setting</PageTitle>
      <p className="mt-1 text-sm text-muted">Monitor Complaints and Search for User Issues</p>

      <div className="mt-6 grid grid-cols-1 gap-5 rounded-[28px] bg-surface-2 p-4 sm:p-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          {ITEMS.filter((it) => !it.organizer || role === "organizer").map((it) => {
            const active = tab === it.value;
            return (
              <button
                key={it.value}
                type="button"
                onClick={() => setTab(it.value)}
                className={cn(
                  "flex h-[62px] items-center gap-3 rounded-[14px] px-6 text-[14px] font-medium transition",
                  active ? "bg-accent-gradient text-white shadow-[0_8px_24px_rgba(255,106,0,0.25)]" : "bg-[#141414] text-text hover:bg-surface",
                )}
              >
                <span className={active ? "text-white" : "text-text"}>{it.icon}</span>
                {it.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setTab("delete")}
            className={cn(
              "flex h-[62px] items-center gap-3 rounded-[14px] px-6 text-[14px] font-medium transition",
              tab === "delete" ? "bg-[#3a1616] text-danger ring-1 ring-danger/40" : "bg-[#221313] text-danger hover:bg-[#2c1616]",
            )}
          >
            <IconTrash size={16} /> Delete Account
          </button>

          {role !== "organizer" && (
            <button
              type="button"
              onClick={becomeOrganizer}
              className="relative mt-2 flex items-center gap-4 overflow-hidden rounded-[16px] border border-accent/40 bg-gradient-to-br from-[#1b1b1b] to-[#0d0d0d] p-4 text-left transition hover:border-accent/70"
            >
              <span className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-accent/25 blur-2xl" />
              <span className="relative grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-[#111] text-accent shadow-[0_0_30px_rgba(255,106,0,0.35)] ring-1 ring-accent/40">
                <IconTeam size={38} />
              </span>
              <span className="relative">
                <span className="block text-[18px] font-semibold text-text">
                  Become <span className="text-accent">Organizer</span>
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-muted">Create events, manage guests, and grow your audience.</span>
              </span>
            </button>
          )}
        </div>

        <div className="min-w-0 self-start rounded-[32px] bg-surface p-4 sm:p-6">
          {tab === "password" && <ChangePassword />}
          {tab === "terms" && <TextPanel title="Terms and Conditions" />}
          {tab === "bank" && <BankAccountsPanel />}
          {tab === "wallet" && <WalletPanel />}
          {tab === "privacy" && <TextPanel title="Privacy Policy" />}
          {tab === "faq" && <FaqPanel />}
          {tab === "support" && <SupportPanel />}
          {tab === "delete" && <DeletePanel />}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-6 text-center text-[16px] font-semibold text-text">{children}</h2>;
}

function ChangePassword() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!current) return setErr("Enter your current password.");
    if (!strongPassword(next)) return setErr("New password must be 12+ characters with upper, lower, number and symbol.");
    if (next !== confirm) return setErr("Passwords do not match.");
    if (next === current) return setErr("New password must differ from the current one.");
    setErr(null);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast("Password changed successfully", "success");
  };

  return (
    <div className="mx-auto max-w-[420px]">
      <PanelTitle>Change Password</PanelTitle>
      <div className="flex flex-col gap-5">
        <Field label="Current Password">
          <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••••" className="bg-[#0d0d0d]" />
        </Field>
        <Field label="Set New Password" error={err ?? undefined}>
          <div className="flex flex-col gap-3">
            <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} placeholder="New Password" className="bg-[#0d0d0d]" />
            <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" className="bg-[#0d0d0d]" />
          </div>
        </Field>
        <ul className="list-disc space-y-1 pl-5 text-[12px] text-muted">
          <li>At least 12 characters long but 14 or more is better.</li>
          <li>A combination of uppercase letters, lowercase letters, numbers, and symbols.</li>
        </ul>
        <Button variant="white" block className="mt-4" onClick={submit}>
          Change Password
        </Button>
      </div>
    </div>
  );
}

function TextPanel({ title }: { title: string }) {
  return (
    <div>
      <PanelTitle>{title}</PanelTitle>
      <div className="flex flex-col gap-4 text-[12px] leading-relaxed text-muted">
        {[0, 1, 2, 3].map((i) => (
          <p key={i}>{LOREM}</p>
        ))}
      </div>
    </div>
  );
}

function FaqPanel() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      <PanelTitle>FAQ</PanelTitle>
      <div className="flex flex-col gap-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-[14px] bg-[#0d0d0d]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-medium text-text"
              >
                {f.q}
                <IconChevronDown size={18} className={cn("shrink-0 text-white transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
              {isOpen && <p className="px-4 pb-4 text-[12px] leading-relaxed text-muted">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Support (Figma): support-agent illustration, "Need more help?" and the Email Support row. */
function SupportPanel() {
  return (
    <div>
      <PanelTitle>Support</PanelTitle>
      <Image
        src="/images/support-illustration.svg"
        alt="Support agent"
        width={260}
        height={210}
        className="mx-auto h-auto w-[220px] sm:w-[260px]"
      />
      <h3 className="mt-5 text-center text-[24px] font-bold text-text sm:text-[26px]">Need more help?</h3>
      <p className="mx-auto mt-2 max-w-[290px] text-center text-[14px] leading-relaxed text-text/90">
        Our dedicated team is ready to connect and support you anytime.
      </p>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="mt-8 flex items-center gap-3.5 rounded-[16px] bg-[#0d0d0d] px-5 py-3.5 transition hover:bg-[#151515]"
      >
        <IconMail size={30} className="shrink-0 text-accent" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-semibold text-text">Email Support</span>
          <span className="truncate text-xs text-text/90">{SUPPORT_EMAIL}</span>
        </span>
      </a>
    </div>
  );
}

function DeletePanel() {
  const [open, setOpen] = useState(false);
  const signOut = useNest((s) => s.signOut);
  const router = useRouter();
  const toast = useToast();
  const confirm = () => {
    setOpen(false);
    signOut();
    toast("Your account has been deleted", "info");
    router.replace("/auth/role");
  };
  return (
    <div className="mx-auto max-w-[420px]">
      <PanelTitle>Delete Account</PanelTitle>
      <p className="text-[13px] leading-relaxed text-muted">
        Deleting your account permanently removes your profile, posts, tickets and messages. This action cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-full bg-[#e5323a] px-7 text-[15px] font-semibold text-white transition hover:bg-[#c92a31]"
      >
        Delete my account
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Delete account?">
        <p className="text-sm text-muted">Are you sure? All of your data will be permanently erased.</p>
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" block onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={confirm}
            className="inline-flex h-13 w-full items-center justify-center rounded-full bg-[#e5323a] px-7 text-[15px] font-semibold text-white transition hover:bg-[#c92a31]"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
