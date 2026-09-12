"use client";

import { useRouter } from "next/navigation";
import { useNest } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function OrgSuccessActions() {
  const router = useRouter();
  const setDraft = useNest((s) => s.setDraft);
  return (
    <>
      <Button
        variant="white"
        size="lg"
        onClick={() => {
          setDraft({ id: uid("draft"), step: 1 });
          router.push("/organizer/events/new/details");
        }}
      >
        Create Event
      </Button>
      <Button variant="primary" size="lg" href="/dashboard">
        Go to Home
      </Button>
    </>
  );
}
