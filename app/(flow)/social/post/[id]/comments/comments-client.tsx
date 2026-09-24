"use client";

import { useMemo, useRef, useState } from "react";
import { FlowPage } from "@/components/shell/flow-layout";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { IconClose, IconHeart, IconSend, IconSmile } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { compact } from "@/lib/data";
import { useNest } from "@/lib/store";
import type { Comment } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const EMOJIS = ["😀", "😂", "🔥", "❤️", "🙌", "👏", "🎉", "😍", "🤩", "👀", "💯", "🙏", "😎", "🥳", "✨", "🧡"];

export function CommentsClient({ id }: { id: string }) {
  const post = useNest((s) => s.posts.find((p) => p.id === id));
  const comments = useNest((s) => s.comments);
  const addComment = useNest((s) => s.addComment);
  const toast = useToast();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [emoji, setEmoji] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => comments.filter((c) => c.postId === id), [comments, id]);

  const send = () => {
    const t = text.trim();
    if (!t || !post) return;
    addComment(post.id, t, replyTo?.id);
    setText("");
    setReplyTo(null);
    setEmoji(false);
    toast(replyTo ? "Reply posted" : "Comment posted", "success");
  };

  const toggleLike = (cid: string) => setLiked((m) => ({ ...m, [cid]: !m[cid] }));

  const renderComment = (c: Comment, nested = false) => {
    const isLiked = !!liked[c.id];
    const replies = c.replies ?? [];
    const showAll = !!expanded[c.id];
    const visible = showAll ? replies : replies.slice(0, 1);
    return (
      <div key={c.id} className={cn("flex flex-col gap-2", nested && "ml-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Avatar src={c.authorAvatar} alt={c.authorName} size={nested ? 26 : 32} />
            <span className="text-[15px] font-semibold text-text">{c.authorName}</span>
            <span className="text-xs text-dim">· {timeAgo(c.createdAt)}</span>
          </div>
          {!nested && (
            <button type="button" onClick={() => toggleLike(c.id)} className="flex items-center gap-1.5 text-xs text-muted">
              <span className={cn("grid h-6 w-6 place-items-center rounded-full", isLiked ? "bg-[#ff2d55] text-white" : "bg-white text-[#0d0d0d]")}>
                <IconHeart size={13} filled />
              </span>
              {compact(c.likes + (isLiked ? 1 : 0))}
            </button>
          )}
        </div>
        <div className="flex items-end justify-between gap-4 pl-[42px]">
          <p className="text-[13px] leading-relaxed text-muted">{c.text}</p>
          {!nested && (
            <button
              type="button"
              onClick={() => {
                setReplyTo(c);
                inputRef.current?.focus();
              }}
              className="shrink-0 text-[13px] font-semibold text-text hover:text-accent"
            >
              Reply
            </button>
          )}
        </div>
        {!nested && visible.length > 0 && (
          <div className="flex flex-col gap-3 pl-[12px]">
            {visible.map((r) => renderComment(r, true))}
            {replies.length > 1 && !showAll && (
              <button type="button" onClick={() => setExpanded((m) => ({ ...m, [c.id]: true }))} className="ml-3 text-left text-[13px] font-semibold text-text hover:text-accent">
                View {replies.length - 1} more replies
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <FlowPage title={post ? `Comment ${compact(post.comments)}` : "Comments"} width="md" className="pb-32">
      {!post ? (
        <EmptyState title="Post not found" sub="This post may have been removed." />
      ) : list.length === 0 ? (
        <EmptyState title="No comments yet" sub="Be the first to say something." />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => (
            <div key={c.id} className="rounded-[16px] bg-surface-2 p-4">
              {renderComment(c)}
            </div>
          ))}
        </div>
      )}

      {post && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-5 py-4 backdrop-blur md:px-10">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-2">
            {replyTo && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs text-muted">
                  Replying to <span className="font-semibold text-text">{replyTo.authorName}</span>
                  <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="text-dim hover:text-text">
                    <IconClose size={12} />
                  </button>
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="relative flex h-13 flex-1 items-center rounded-full bg-surface px-6">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message…"
                  className="h-full flex-1 bg-transparent text-sm text-text placeholder:text-dim"
                />
                <button type="button" onClick={() => setEmoji((v) => !v)} className="text-text hover:text-accent" aria-label="Emoji">
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
                className="grid h-13 w-13 shrink-0 place-items-center rounded-full bg-accent-gradient text-white shadow-[0_8px_24px_rgba(255,106,0,0.35)] transition hover:brightness-110 disabled:opacity-50"
                aria-label="Send"
              >
                <IconSend size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </FlowPage>
  );
}
