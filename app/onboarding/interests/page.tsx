"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/form";
import { DisplayTitle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { INTERESTS } from "@/lib/data";
import { useNest } from "@/lib/store";

export default function InterestsPage() {
  const router = useRouter();
  const toast = useToast();
  const saved = useNest((s) => s.interests);
  const hydrated = useNest((s) => s.hydrated);
  const setInterests = useNest((s) => s.setInterests);
  const setOnboarded = useNest((s) => s.setOnboarded);
  const updateUser = useNest((s) => s.updateUser);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    // Sync from the persisted store once hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated && saved.length) setSelected(saved);
  }, [hydrated, saved]);

  const toggle = (tag: string) =>
    setSelected((s) => (s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]));

  const save = () => {
    if (!selected.length) {
      toast("Pick at least one interest", "error");
      return;
    }
    setInterests(selected);
    updateUser({ interests: selected });
    setOnboarded(true);
    toast("You're all set!", "success");
    router.push("/dashboard");
  };

  return (
    <FlowPage title="Back" backHref="/onboarding/profile" width="sm">
      <div className="flex flex-col gap-8">
        <DisplayTitle sub="Interest tags personalize discovery">
          Choose
          <br />
          Interests
        </DisplayTitle>

        <div className="flex flex-wrap gap-3">
          {INTERESTS.map((tag) => (
            <Chip key={tag} size="lg" active={selected.includes(tag)} removable onClick={() => toggle(tag)}>
              {tag}
            </Chip>
          ))}
        </div>

        <Button type="button" variant="white" size="lg" block onClick={save} className="mt-4 max-w-[380px]">
          Save &amp; Continue
        </Button>
      </div>
    </FlowPage>
  );
}
