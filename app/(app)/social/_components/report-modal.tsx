"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/types";

const REASONS = ["Nudity", "Offensive Language", "Someone Else", "Other"] as const;

export function ReportModal({ post, open, onClose }: { post: Post | null; open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState<string>("Other");
  const [comment, setComment] = useState("");
  const toast = useToast();

  const submit = () => {
    toast("Report submitted. Thanks for keeping NEST safe.", "success");
    setComment("");
    setReason("Other");
    onClose();
  };

  if (!post) return null;
  const cover = post.media[0]?.url;

  return (
    <Modal open={open} onClose={onClose} title="Report" className="max-w-[460px] bg-[#141414] p-5">
      <div className="flex items-start gap-3">
        <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[12px] bg-surface">
          {cover && <Image src={cover} alt="" fill sizes="70px" className="object-cover" unoptimized={cover.startsWith("/uploads")} />}
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-flex h-5 items-center rounded-full bg-accent px-2 text-[10px] font-semibold text-white">Post</span>
          <p className="mt-1 truncate text-[15px] font-semibold text-text">{post.title}</p>
          <p className="line-clamp-2 text-[11px] leading-snug text-muted">{post.caption}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {REASONS.map((r) => {
          const active = reason === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                "h-8 rounded-full px-4 text-xs font-medium transition",
                active ? (r === "Other" ? "bg-[#e5323a] text-white" : "bg-accent text-white") : "bg-surface text-text hover:bg-surface-3",
              )}
            >
              {r}
            </button>
          );
        })}
      </div>

      <div className="relative mt-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="Enter Additional Comment"
          className="min-h-[120px] w-full resize-none rounded-[20px] bg-[#0d0d0d] px-4 py-3 pb-8 text-[13px] text-text placeholder:text-dim border border-border focus:border-border-soft"
        />
        <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-dim">{comment.length}/500</span>
      </div>

      <Button variant="white" block className="mt-4" onClick={submit}>
        Submit Report
      </Button>
    </Modal>
  );
}
