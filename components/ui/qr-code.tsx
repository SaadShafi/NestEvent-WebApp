"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { copyText, downloadUrl } from "@/lib/utils";
import { Button } from "./button";
import { IconDownload, IconShareNodes } from "./icons";
import { useToast } from "./toast";

/** Renders a scannable QR code for `value` on a canvas. */
export function QrCanvas({ value, size = 180, className }: { value: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#ffffff", light: "#00000000" },
      errorCorrectionLevel: "M",
    }).catch(() => {});
  }, [value, size]);
  return <canvas ref={ref} width={size} height={size} className={className} aria-label={`QR code ${value}`} />;
}

/**
 * Builds a downloadable ticket PNG (event title + details + QR) and offers
 * Share (Web Share API with file, falling back to clipboard) and Download.
 */
export function QrActions({
  value,
  title,
  subtitle,
  fileName = "nest-ticket.png",
  shareUrl,
}: {
  value: string;
  title: string;
  subtitle?: string;
  fileName?: string;
  shareUrl?: string;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState<"share" | "download" | null>(null);

  async function buildTicketPng(): Promise<Blob> {
    const W = 720;
    const H = 900;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    // background
    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, W, H);
    // card
    ctx.fillStyle = "#1d1d1d";
    roundRect(ctx, 40, 40, W - 80, H - 80, 40);
    ctx.fill();
    // header band
    const grad = ctx.createLinearGradient(0, 40, 0, 220);
    grad.addColorStop(0, "#ff8a1f");
    grad.addColorStop(1, "#ff6a00");
    ctx.fillStyle = grad;
    roundRect(ctx, 40, 40, W - 80, 180, 40);
    ctx.fill();
    ctx.fillStyle = "#1d1d1d";
    ctx.fillRect(40, 180, W - 80, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 44px Urbanist, Poppins, sans-serif";
    ctx.fillText("NEST", 80, 120);
    ctx.font = "500 20px Poppins, sans-serif";
    ctx.fillText("Event Ticket", 80, 158);
    // title
    ctx.fillStyle = "#fcfcfc";
    ctx.font = "600 32px Poppins, sans-serif";
    wrapText(ctx, title, 80, 290, W - 160, 40);
    if (subtitle) {
      ctx.fillStyle = "#b9b9b9";
      ctx.font = "400 20px Poppins, sans-serif";
      wrapText(ctx, subtitle, 80, 380, W - 160, 28);
    }
    // dashed separator
    ctx.strokeStyle = "#3a3a3a";
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(80, 440);
    ctx.lineTo(W - 80, 440);
    ctx.stroke();
    ctx.setLineDash([]);
    // QR
    const qrUrl = await QRCode.toDataURL(value, { width: 340, margin: 1, color: { dark: "#ffffff", light: "#1d1d1d" } });
    const img = await loadImage(qrUrl);
    ctx.drawImage(img, (W - 340) / 2, 470, 340, 340);
    ctx.fillStyle = "#8d8d8d";
    ctx.font = "400 16px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan this QR Code at the entrance", W / 2, 850);
    ctx.fillText(value, W / 2, 878);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
  }

  const download = async () => {
    setBusy("download");
    try {
      const blob = await buildTicketPng();
      const url = URL.createObjectURL(blob);
      downloadUrl(url, fileName);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast("QR ticket downloaded", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Download failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    setBusy("share");
    try {
      const blob = await buildTicketPng();
      const file = new File([blob], fileName, { type: "image/png" });
      const url = shareUrl ?? (typeof window !== "undefined" ? window.location.href : "");
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ title, text: `${title} — ${subtitle ?? ""}`.trim(), files: [file] });
        toast("Shared", "success");
      } else if (nav.share) {
        await nav.share({ title, text: `${title} — ${subtitle ?? ""}`.trim(), url });
        toast("Shared", "success");
      } else {
        const ok = await copyText(`${title}\n${subtitle ?? ""}\nTicket: ${value}\n${url}`);
        toast(ok ? "Ticket link copied to clipboard" : "Sharing not supported", ok ? "success" : "error");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast("Share cancelled", "info");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center justify-center gap-8">
      <button
        type="button"
        onClick={share}
        disabled={busy !== null}
        className="inline-flex items-center gap-2 text-[15px] font-medium text-text transition hover:text-accent disabled:opacity-50"
      >
        <IconShareNodes size={20} />
        Share Via
      </button>
      <Button onClick={download} loading={busy === "download"} icon={<IconDownload size={18} />} className="min-w-[160px]">
        Download QR
      </Button>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
