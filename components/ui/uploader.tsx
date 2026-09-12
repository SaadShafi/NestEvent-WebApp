"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn, uploadFiles } from "@/lib/utils";
import { useToast } from "./toast";
import { IconClose, IconPlus, IconWarn } from "./icons";
import { Spinner } from "./primitives";

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

/**
 * Drag-and-drop / click uploader. Files are POSTed to /api/upload and the
 * returned public URLs are handed back via onUploaded.
 */
export function UploadZone({
  onUploaded,
  accept = "image/*,video/*",
  multiple = true,
  title = "Upload Files",
  subtitle = "Upload profile Cover",
  buttonLabel = "Upload",
  className,
  variant = "box",
  children,
}: {
  onUploaded: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  className?: string;
  variant?: "box" | "large";
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handle = useCallback(
    async (list: FileList | File[]) => {
      const files = Array.from(list);
      if (!files.length) return;
      setBusy(true);
      try {
        const uploaded = await uploadFiles(files);
        onUploaded(uploaded);
        toast(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded`, "success");
      } catch (e) {
        toast(e instanceof Error ? e.message : "Upload failed", "error");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onUploaded, toast],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-[28px] border border-dashed transition",
        drag ? "border-accent bg-accent/10" : "border-[#4a4a4a] bg-[#111]",
        variant === "box" ? "flex flex-col items-center justify-center gap-3 px-6 py-8" : "flex min-h-[420px] flex-col items-center justify-center gap-2 bg-surface-2 border-accent/70",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && handle(e.target.files)}
      />
      {children ?? (
        <>
          <span className={cn("grid place-items-center rounded-full", variant === "box" ? "h-12 w-12 border border-dashed border-[#5a5a5a] text-text" : "h-9 w-9 bg-white text-[#0d0d0d]")}>
            {busy ? <Spinner /> : <IconPlus size={18} />}
          </span>
          <div className="text-center">
            <p className={cn("font-semibold text-text", variant === "large" ? "text-[22px]" : "text-sm")}>{title}</p>
            <p className={cn("text-dim", variant === "large" ? "text-base" : "text-xs")}>{subtitle}</p>
          </div>
          {variant === "box" && (
            <span className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-[#2a1a0c] text-sm font-semibold text-accent">
              {busy ? "Uploading…" : buttonLabel}
            </span>
          )}
        </>
      )}
    </div>
  );
}

export function MediaThumb({
  src,
  onRemove,
  size = 120,
  className,
  type,
}: {
  src: string;
  onRemove?: () => void;
  size?: number;
  className?: string;
  type?: string;
}) {
  const isVideo = type?.startsWith("video") || /\.(mp4|webm|mov)$/i.test(src);
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-[18px] bg-surface", className)} style={{ width: size, height: size }}>
      {isVideo ? (
        <video src={src} className="h-full w-full object-cover" muted />
      ) : (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-text"
        >
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-danger text-white">
            <IconClose size={8} />
          </span>
          Remove
        </button>
      )}
    </div>
  );
}

export function PhotoGuidelineTile({ size = 120 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#5a5a5a] bg-[#111] text-center"
      style={{ width: size, height: size }}
      title="Use a clear, well-lit photo. No logos or text overlays."
    >
      <span className="grid h-9 w-9 place-items-center rounded-full border border-[#5a5a5a] text-text">
        <IconWarn size={18} />
      </span>
      <span className="text-[11px] text-muted">Photos Guideline</span>
    </div>
  );
}
