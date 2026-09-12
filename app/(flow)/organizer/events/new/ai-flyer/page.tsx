"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { FlowPage } from "@/components/shell/flow-layout";
import { DisplayTitle, Spinner } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { IconCheckCircle, IconClose } from "@/components/ui/icons";
import { useDraft, WIZARD } from "../_lib/use-draft";

type Kind = "flyer" | "caption" | "hashtags";

const FLYERS = ["/images/posters/party.jpg", "/images/posters/night.jpg"];
const CAPTIONS = [
  "Midnight Garden opens its gates. One night, one crowd, no ordinary house party. 21+ only.",
  "The garden blooms after dark. Pull up for house music under the lights. Doors 10PM.",
];
const HASHTAGS = ["#MidnightGarden #HouseNight #21Plus #NestEvents #AfterDark", "#GardenAfterDark #HouseMusic #NightBloom #NestEvents #DanceTillDawn"];
const KINDS: { value: Kind; label: string }[] = [
  { value: "flyer", label: "Flyer" },
  { value: "caption", label: "Caption" },
  { value: "hashtags", label: "Hashtags" },
];

const pick = (kind: Kind, i: number) =>
  kind === "flyer" ? FLYERS[i % FLYERS.length] : kind === "caption" ? CAPTIONS[i % CAPTIONS.length] : HASHTAGS[i % HASHTAGS.length];

const GENERATE_MS = 1200;

export default function AiFlyerPage() {
  const router = useRouter();
  const toast = useToast();
  const { draft, patch, ready } = useDraft();
  const [prompt, setPrompt] = useState("Create A Sleek Midnight Garden Flyer For A 21+ House Event");
  const [kind, setKind] = useState<Kind>("flyer");
  const [index, setIndex] = useState(0);
  const [generating, setGenerating] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Schedules the fake generation; state updates happen inside the timer callback. */
  const schedule = (k: Kind, nextIndex: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIndex(nextIndex);
      setResult(pick(k, nextIndex));
      setGenerating(false);
    }, GENERATE_MS);
  };

  // Initial generation on mount (state already starts in the "generating" phase).
  useEffect(() => {
    schedule("flyer", 0);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const generate = (k: Kind, nextIndex: number) => {
    setGenerating(true);
    setSaved(false);
    schedule(k, nextIndex);
  };

  const useGenerated = () => {
    if (!result || generating) return toast("Wait for generation to finish", "info");
    if (kind === "flyer") {
      patch({ flyer: result, cover: result });
      toast("Flyer applied to your event", "success");
    } else if (kind === "caption") {
      patch({ tagline: result.slice(0, 100) });
      toast("Caption applied as tagline", "success");
    } else {
      patch({ description: `${draft?.description ?? ""}\n\n${result}`.trim() });
      toast("Hashtags added to description", "success");
    }
    router.push(WIZARD.details);
  };

  const isImage = kind === "flyer";

  return (
    <FlowPage title="Back" backHref={WIZARD.details} width="sm">
      <div className="flex flex-col gap-6">
        <DisplayTitle>
          AI Flyer Content
          <br />
          Assistant
        </DisplayTitle>

        <div className="relative h-[300px] overflow-hidden rounded-[28px] border border-dashed border-accent bg-surface-2">
          {generating || !ready ? (
            <div className="grid h-full w-full place-items-center">
              <div className="flex flex-col items-center gap-3 text-sm text-muted">
                <Spinner className="h-7 w-7" />
                Generating…
              </div>
            </div>
          ) : result === null ? (
            <div className="grid h-full w-full place-items-center px-6 text-center text-sm text-dim">Removed. Hit Regenerate to create a new {kind}.</div>
          ) : isImage ? (
            <Image src={result} alt="Generated flyer" fill sizes="520px" className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center px-8 text-center font-display text-[24px] font-bold leading-snug text-text">{result}</div>
          )}
          {!generating && result !== null && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSaved(true);
                  if (isImage) patch({ flyer: result, cover: result });
                  toast(saved ? "Already saved" : "Saved to your event", "success");
                }}
                className={cn("inline-flex h-8 items-center gap-1.5 rounded-full bg-black/70 px-3 text-xs font-medium text-white backdrop-blur", saved && "ring-1 ring-success")}
              >
                <IconCheckCircle size={16} className="text-success" />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSaved(false);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/70 px-3 text-xs font-medium text-white backdrop-blur"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-danger">
                  <IconClose size={9} />
                </span>
                Remove
              </button>
            </div>
          )}
        </div>

        <Field label="Prompt">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} max={1000} className="min-h-[180px]" />
        </Field>

        <Field label="Generate">
          <Select
            value={kind}
            onChange={(e) => {
              const k = e.target.value as Kind;
              setKind(k);
              generate(k, 0);
            }}
            options={KINDS}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="white" size="lg" onClick={useGenerated} disabled={generating || result === null}>
            Use Generated
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (!prompt.trim()) return toast("Enter a prompt first", "error");
              generate(kind, index + 1);
            }}
            loading={generating}
          >
            Regenerate
          </Button>
        </div>
      </div>
    </FlowPage>
  );
}
