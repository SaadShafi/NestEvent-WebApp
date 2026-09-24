"use client";

import { useState } from "react";
import { useNest } from "@/lib/store";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { IconWarn } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/primitives";
import { Reel } from "@/app/(app)/social/_components/reel";
import { ReportModal } from "@/app/(app)/social/_components/report-modal";

/** "View Post": a single post laid out like a feed reel, with comments and report (Figma: post → View Post → Comment / Report). */
export function ViewPost({ id }: { id: string }) {
  const post = useNest((s) => s.posts.find((p) => p.id === id));
  const [muted, setMuted] = useState(true);
  const [report, setReport] = useState(false);

  if (!post) {
    return (
      <FlowPage title="View Post" width="md">
        <EmptyState title="Post not found" sub="This post may have been removed." action={<Button href="/social">Go to Social</Button>} />
      </FlowPage>
    );
  }

  return (
    <FlowPage title="View Post" width="md">
      <div className="relative mx-auto w-full max-w-[480px]">
        <div className="h-[calc(100svh-180px)] min-h-[520px] overflow-hidden rounded-[16px] bg-black md:h-[calc(100vh-170px)]">
          <Reel post={post} index={0} isActive muted={muted} onToggleMute={() => setMuted((m) => !m)} onReport={() => setReport(true)} />
        </div>
        <button
          type="button"
          onClick={() => setReport(true)}
          className="absolute left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
          aria-label="Report post"
          title="Report post"
        >
          <IconWarn size={20} />
        </button>
      </div>
      <ReportModal post={post} open={report} onClose={() => setReport(false)} />
    </FlowPage>
  );
}
