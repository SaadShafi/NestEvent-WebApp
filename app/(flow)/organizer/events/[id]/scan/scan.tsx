"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { IconCheckCircle, IconWarn } from "@/components/ui/icons";
import { stamp, useEventOps, type ScanOutcome } from "../_lib/event-ops";
import { IconCamera, IconKeypad, IconScan, OpsPage } from "../_lib/ops-ui";

/* The Barcode Detection API isn't in TypeScript's DOM lib yet. */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

const detectorCtor = () => (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
const noopSubscribe = () => () => {};

type CamState = "idle" | "starting" | "live" | "denied" | "error" | "unsupported";

const IconBolt = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export function ScanTickets({ id }: { id: string }) {
  return (
    <OpsPage id={id} title="Scan Ticket">
      {(event) => <Scanner event={event} />}
    </OpsPage>
  );
}

/** Scan Ticket — camera QR scanner (BarcodeDetector) with manual entry; a hit opens the holder's Ticket screen (Figma). */
function Scanner({ event }: { event: EventItem }) {
  const toast = useToast();
  const router = useRouter();
  const { orders, scans, scan } = useEventOps(event);
  const canDetect = useSyncExternalStore(noopSubscribe, () => !!detectorCtor(), () => false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const handleRef = useRef<(code: string) => void>(() => {});

  const [cam, setCam] = useState<CamState>("idle");
  const [torch, setTorch] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanOutcome | null>(null);

  const handle = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return toast("Enter a ticket code", "error");
      const out = scan(value);
      setResult(out);
      if (out.state === "invalid") {
        toast(out.reason, "error");
        return;
      }
      if (out.state === "already") toast(`Already scanned ${stamp(out.scannedAt)}`, "error");
      else toast("Ticket checked in", "success");
      pausedRef.current = true;
      router.push(`/organizer/events/${event.id}/ticket/${out.order.id}`);
    },
    [scan, toast, router, event.id],
  );

  useEffect(() => {
    handleRef.current = handle;
  }, [handle]);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setTorch(null);
    setCam("idle");
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam("unsupported");
      return;
    }
    setCam("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("no video element");
      video.srcObject = stream;
      await video.play();
      setCam("live");

      const track = stream.getVideoTracks()[0];
      const caps = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
      setTorch(caps.torch ? false : null);

      const Ctor = detectorCtor();
      if (!Ctor) return;
      const detector = new Ctor({ formats: ["qr_code"] });
      let busy = false;
      timerRef.current = window.setInterval(async () => {
        if (busy || pausedRef.current || video.readyState < 2) return;
        busy = true;
        try {
          const found = await detector.detect(video);
          const value = found[0]?.rawValue;
          const now = Date.now();
          // Ignore the same code while it's still in front of the lens.
          if (value && (value !== lastRef.current.code || now - lastRef.current.at > 3000)) {
            lastRef.current = { code: value, at: now };
            handleRef.current(value);
          }
        } catch {
          /* frame not ready */
        } finally {
          busy = false;
        }
      }, 350);
    } catch (e) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const name = e instanceof DOMException ? e.name : "";
      setCam(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error");
    }
  };

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || torch === null) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch {
      toast("Torch is not available on this camera", "error");
    }
  };

  const submitManual = () => {
    handle(code);
    setCode("");
  };

  const testScan = () => {
    const next = orders.flatMap((o) => (o.refund === "refunded" ? [] : o.tickets)).find((t) => !scans[t.code]);
    if (!next) return toast("Every ticket for this event is already scanned", "info");
    handle(next.code);
  };

  const stats = useMemo(() => {
    const codes = orders.filter((o) => o.refund !== "refunded").flatMap((o) => o.tickets.map((t) => t.code));
    const checked = codes.filter((c) => scans[c]).length;
    return { total: codes.length, checked };
  }, [orders, scans]);

  const recent = useMemo(() => {
    const byCode = new Map(orders.flatMap((o) => o.tickets.map((t) => [t.code, { order: o, ticket: t }] as const)));
    return Object.entries(scans)
      .sort((a, b) => (a[1] < b[1] ? 1 : -1))
      .slice(0, 5)
      .map(([c, at]) => ({ code: c, at, hit: byCode.get(c) }));
  }, [orders, scans]);

  const live = cam === "live";

  return (
    <div className="flex flex-col gap-8">
      <p className="-mt-2 text-[15px] text-dim">{event.title}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        {/* Camera */}
        <div className="flex flex-col gap-4">
          <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-[28px] bg-black">
            <video ref={videoRef} playsInline muted className={cn("absolute inset-0 h-full w-full object-cover", !live && "invisible")} />

            {live ? (
              <>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="relative h-[62%] w-[62%]">
                    {["left-0 top-0 border-l-4 border-t-4 rounded-tl-[14px]", "right-0 top-0 border-r-4 border-t-4 rounded-tr-[14px]", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[14px]", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-[14px]"].map((c) => (
                      <span key={c} className={cn("absolute h-10 w-10 border-accent", c)} />
                    ))}
                  </div>
                </div>
                <span className="absolute inset-x-4 bottom-4 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full bg-black/55 px-4 py-2 text-center text-xs text-text backdrop-blur sm:text-sm">
                  {canDetect ? "Align the QR code within the frame" : "This browser can't read QR codes from the camera. Enter the code manually."}
                </span>
                {torch !== null && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={cn(
                      "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/45 backdrop-blur transition",
                      torch ? "text-accent" : "text-text",
                    )}
                    aria-label={torch ? "Turn torch off" : "Turn torch on"}
                  >
                    <IconBolt />
                  </button>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-accent/15 text-accent">
                  {cam === "denied" || cam === "error" || cam === "unsupported" ? <IconWarn size={32} /> : <IconScan size={34} />}
                </span>
                <p className="max-w-[300px] text-sm text-muted">
                  {cam === "denied"
                    ? "Camera access was blocked. Allow it in your browser's site settings, or enter the ticket code instead."
                    : cam === "unsupported"
                      ? "This browser can't open the camera here. Enter the ticket code instead."
                      : cam === "error"
                        ? "We couldn't start the camera. Check that no other app is using it, or enter the code instead."
                        : "Nest needs camera access to read attendee QR codes at the door."}
                </p>
                {cam !== "unsupported" && (
                  <Button variant="primary" onClick={start} loading={cam === "starting"} icon={<IconCamera size={18} />}>
                    {cam === "denied" || cam === "error" ? "Try Again" : "Start Camera"}
                  </Button>
                )}
              </div>
            )}
          </div>
          {live && (
            <div className="mx-auto flex w-full max-w-[560px] justify-center">
              <Button variant="ghost" size="sm" onClick={stop}>
                Stop Camera
              </Button>
            </div>
          )}
        </div>

        {/* Manual entry + status */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-[24px] bg-surface-2 p-5">
            <span className="text-sm text-dim">Checked in</span>
            <span className="font-display text-[32px] font-bold leading-none text-text">
              {stats.checked}
              <span className="text-[20px] text-dim"> / {stats.total}</span>
            </span>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-accent-gradient transition-all" style={{ width: `${stats.total ? (stats.checked / stats.total) * 100 : 0}%` }} />
            </div>
          </div>

          <form
            className="flex flex-col gap-3 rounded-[24px] bg-surface-2 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              submitManual();
            }}
          >
            <label htmlFor="ticket-code" className="flex items-center gap-2 text-[15px] font-medium text-text">
              <IconKeypad size={16} className="text-accent" />
              Enter code manually
            </label>
            <Input
              id="ticket-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="NEST-XXXXXXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
            <Button type="submit" variant="white" block>
              Check Ticket
            </Button>
            <Button type="button" variant="ghost" size="sm" block onClick={testScan}>
              Test Scan
            </Button>
          </form>

          {result && <ResultCard result={result} />}

          {recent.length > 0 && (
            <div className="flex flex-col gap-3 rounded-[24px] bg-surface-2 p-5">
              <span className="text-[15px] font-medium text-text">Recent scans</span>
              <ul className="flex flex-col gap-2">
                {recent.map((r) => (
                  <li key={r.code} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-text">{r.hit?.order.buyerName ?? r.code}</span>
                    <span className="shrink-0 text-xs text-dim">{stamp(r.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function ResultCard({ result, compact }: { result: ScanOutcome; compact?: boolean }) {
  const tone = result.state === "valid" ? "success" : result.state === "already" ? "accent" : "danger";
  const title = result.state === "valid" ? "Valid ticket" : result.state === "already" ? "Already scanned" : "Invalid ticket";
  const sub =
    result.state === "invalid"
      ? result.reason
      : result.state === "already"
        ? `${result.ticket.ticketTypeName} · first scanned ${stamp(result.scannedAt)}`
        : `${result.ticket.ticketTypeName}${result.ticket.qty > 1 ? ` × ${result.ticket.qty}` : ""} · checked in`;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-[20px] border p-4",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "accent" && "border-accent/30 bg-accent/10 text-accent",
        tone === "danger" && "border-danger/30 bg-danger/10 text-danger",
      )}
    >
      {result.state === "valid" ? <IconCheckCircle size={22} className="shrink-0" /> : <IconWarn size={22} className="shrink-0" />}
      <div className="flex min-w-0 flex-col">
        <span className="text-[15px] font-semibold">{title}</span>
        {!compact && result.state !== "invalid" && <span className="truncate text-sm text-text">{result.order.buyerName}</span>}
        <span className="break-words text-xs text-muted">{sub}</span>
        {result.state === "invalid" && result.code && <span className="mt-1 break-all font-mono text-xs text-dim">{result.code}</span>}
      </div>
    </div>
  );
}
