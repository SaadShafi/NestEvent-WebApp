"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, EmptyState, PageTitle } from "@/components/ui/primitives";
import { IconAttachment, IconCheck, IconDoc, IconDots, IconSearch, IconSend, IconSmile } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useNest } from "@/lib/store";
import type { Message } from "@/lib/types";
import { clockTime, cn, uploadFiles } from "@/lib/utils";

const EMOJIS = ["😀", "😂", "🔥", "❤️", "🙌", "👏", "🎉", "😍", "🤩", "👀", "💯", "🙏", "😎", "🥳", "✨", "🧡"];

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="grid h-[calc(100vh-var(--topbar-h))] place-items-center text-dim">Loading…</div>}>
      <Messages />
    </Suspense>
  );
}

function Messages() {
  const params = useSearchParams();
  const router = useRouter();
  const conversations = useNest((s) => s.conversations);
  const messages = useNest((s) => s.messages);
  const sendMessage = useNest((s) => s.sendMessage);
  const markRead = useNest((s) => s.markConversationRead);
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menu, setMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeId = params.get("c") ?? conversations[0]?.id ?? null;
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q));
  }, [conversations, query]);

  const thread = useMemo(() => (active ? messages.filter((m) => m.conversationId === active.id) : []), [messages, active]);

  const lastSnippet = (id: string) => {
    const last = [...messages].reverse().find((m) => m.conversationId === id);
    if (!last) return "";
    if (last.attachment && !last.text) return last.attachment.type.startsWith("image") ? "Sent a photo" : `Sent ${last.attachment.name}`;
    return last.text;
  };

  useEffect(() => {
    if (active && active.unread > 0) markRead(active.id);
  }, [active, markRead]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, active?.id]);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);

  const open = (id: string) => router.replace(`/messages?c=${id}`);

  const send = () => {
    const t = text.trim();
    if (!t || !active) return;
    sendMessage(active.id, t);
    setText("");
    setEmoji(false);
  };

  const attach = async (list: FileList | null) => {
    if (!list?.length || !active) return;
    setUploading(true);
    try {
      const [file] = await uploadFiles(list);
      if (file) sendMessage(active.id, "", file);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="-mx-4 -mb-16 -mt-8 flex h-[calc(100vh-var(--topbar-h))] overflow-hidden md:-mx-6 md:-mb-20 lg:-mx-8">
      {/* left list */}
      <aside className={cn("flex w-full shrink-0 flex-col border-r border-border md:w-[235px] lg:w-[260px]", active && "hidden md:flex")}>
        <div className="px-4 pt-6">
          <PageTitle>Messages</PageTitle>
          <div className="mt-4 flex h-11 items-center gap-2 rounded-[12px] bg-surface px-4">
            <IconSearch size={16} className="text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations…"
              className="h-full flex-1 bg-transparent text-[13px] text-text placeholder:text-dim"
            />
          </div>
        </div>
        <div className="mt-4 flex-1 overflow-y-auto border-t border-border">
          {filtered.length === 0 && <p className="p-4 text-sm text-dim">No conversations found.</p>}
          {filtered.map((c) => {
            const isActive = c.id === active?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => open(c.id)}
                className={cn("flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-surface", isActive && "bg-surface-2")}
              >
                <span className="relative shrink-0">
                  <Avatar src={c.avatar} alt={c.name} size={44} />
                  {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-bg bg-success" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] font-semibold text-text">{c.name}</span>
                    <span className="shrink-0 text-[10px] text-dim">{c.lastAt}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">{c.subtitle}</span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-text/80">{lastSnippet(c.id)}</span>
                    {c.unread > 0 && (
                      <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">{c.unread}</span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* chat pane */}
      <section className={cn("flex min-w-0 flex-1 flex-col", !active && "hidden md:flex")}>
        {!active ? (
          <div className="grid flex-1 place-items-center p-6">
            <EmptyState title="No conversation selected" sub="Pick a conversation from the list to start chatting." />
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-border px-5 py-3">
              <button type="button" className="md:hidden text-muted" onClick={() => router.replace("/messages")} aria-label="Back">
                ‹
              </button>
              <span className="relative">
                <Avatar src={active.avatar} alt={active.name} size={36} />
                {active.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg bg-success" />}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[15px] font-semibold text-text">{active.name}</p>
                <p className={cn("text-[11px]", active.online ? "text-success" : "text-dim")}>● {active.online ? "Online" : "Offline"}</p>
              </div>
              <div ref={menuRef} className="relative">
                <button type="button" onClick={() => setMenu((m) => !m)} className="grid h-9 w-9 place-items-center rounded-full text-accent hover:bg-surface" aria-label="More">
                  <IconDots size={20} />
                </button>
                {menu && (
                  <div className="absolute right-0 top-11 z-20 w-44 rounded-[14px] border border-border bg-[#141414] p-1 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        router.push(`/users/${active.participantId}`);
                      }}
                      className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-text hover:bg-surface"
                    >
                      View profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        markRead(active.id);
                        toast("Marked as read", "success");
                      }}
                      className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-text hover:bg-surface"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted">Today</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-5">
                {thread.length === 0 && <p className="text-center text-sm text-dim">Say hello to {active.name} 👋</p>}
                {thread.map((m) => (
                  <Bubble key={m.id} m={m} avatar={active.avatar} />
                ))}
              </div>
            </div>

            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-13 flex-1 items-center gap-3 rounded-full bg-surface px-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-muted hover:text-text disabled:opacity-50"
                    aria-label="Attach file"
                  >
                    <IconAttachment size={20} />
                  </button>
                  <input ref={fileRef} type="file" className="hidden" onChange={(e) => attach(e.target.files)} />
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={uploading ? "Uploading…" : "Type a message…"}
                    className="h-full flex-1 bg-transparent text-sm text-text placeholder:text-dim"
                  />
                  <button type="button" onClick={() => setEmoji((v) => !v)} className="text-muted hover:text-text" aria-label="Emoji">
                    <IconSmile size={20} />
                  </button>
                  {emoji && (
                    <div className="absolute bottom-[60px] right-0 grid w-[240px] grid-cols-8 gap-1 rounded-[16px] border border-border bg-[#141414] p-2 shadow-2xl">
                      {EMOJIS.map((e) => (
                        <button key={e} type="button" onClick={() => setText((t) => t + e)} className="grid h-7 w-7 place-items-center rounded-md text-lg hover:bg-surface">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={send}
                  disabled={!text.trim()}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-gradient text-white shadow-[0_8px_24px_rgba(255,106,0,0.35)] transition hover:brightness-110 disabled:opacity-50"
                  aria-label="Send"
                >
                  <IconSend size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Attachment({ a }: { a: NonNullable<Message["attachment"]> }) {
  if (a.type.startsWith("image")) {
    return (
      <a href={a.url} target="_blank" rel="noreferrer" className="relative block h-[180px] w-[240px] overflow-hidden rounded-[14px] bg-surface-3">
        <Image src={a.url} alt={a.name} fill sizes="240px" className="object-cover" unoptimized />
      </a>
    );
  }
  return (
    <a href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-surface-3 px-3 py-2 text-xs text-text hover:bg-border">
      <IconDoc size={16} className="text-accent" />
      <span className="max-w-[200px] truncate">{a.name}</span>
    </a>
  );
}

function Bubble({ m, avatar }: { m: Message; avatar?: string }) {
  const mine = m.senderId === "me";
  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-[16px] bg-surface px-4 py-3">
          {m.attachment && <div className={cn(m.text && "mb-2")}><Attachment a={m.attachment} /></div>}
          {m.text && <p className="text-[14px] text-text">{m.text}</p>}
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-dim">
            {clockTime(m.createdAt)}
            <span className={cn("inline-flex", m.read ? "text-accent" : "text-dim")}>
              <IconCheck size={11} />
              <IconCheck size={11} className="-ml-1.5" />
            </span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex max-w-[70%] flex-col gap-1">
      {m.attachment && <Attachment a={m.attachment} />}
      {m.text && <p className="text-[14px] text-text">{m.text}</p>}
      <div className="flex items-center gap-2">
        <Avatar src={avatar} size={24} />
        <span className="text-[10px] text-dim">{clockTime(m.createdAt)}</span>
      </div>
    </div>
  );
}
