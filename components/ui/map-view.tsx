"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#151515] text-sm text-dim">Loading map…</div>
  ),
});

export function MapView({
  lat,
  lng,
  zoom = 14,
  className,
  label,
  onPick,
  interactive = true,
}: {
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
  label?: string;
  onPick?: (pos: { lat: number; lng: number }) => void;
  interactive?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-[#151515]", className)}>
      {lat != null && lng != null ? (
        <LeafletMap lat={lat} lng={lng} zoom={zoom} label={label} onPick={onPick} interactive={interactive} />
      ) : (
        <div className="grid h-full w-full place-items-center px-6 text-center text-sm text-dim">
          Enter a location above to preview it on the map
        </div>
      )}
    </div>
  );
}
