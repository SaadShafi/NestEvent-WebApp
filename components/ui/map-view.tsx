"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { searchPlaces } from "@/lib/geo";
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
  address,
  zoom = 14,
  className,
  label,
  onPick,
  interactive = true,
  zoomControl,
}: {
  lat?: number;
  lng?: number;
  /** Used to look the place up when no coordinates are stored (e.g. an address typed without picking a suggestion). */
  address?: string;
  zoom?: number;
  className?: string;
  label?: string;
  onPick?: (pos: { lat: number; lng: number }) => void;
  interactive?: boolean;
  /** Show the +/- buttons (defaults to `interactive`). */
  zoomControl?: boolean;
}) {
  const hasCoords = lat != null && lng != null;
  const query = hasCoords ? "" : (address ?? "").trim();
  const [found, setFound] = useState<{ q: string; lat: number; lng: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!query || found?.q === query) return;
    const ctrl = new AbortController();
    searchPlaces(query, ctrl.signal)
      .then((r) => {
        if (r[0]) setFound({ q: query, lat: r[0].lat, lng: r[0].lng });
        else setFailed(query);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setFailed(query);
      });
    return () => ctrl.abort();
  }, [query, found?.q]);

  const point = hasCoords ? { lat, lng } : found && found.q === query ? found : null;
  const looking = !!query && !point && failed !== query;

  return (
    <div className={cn("relative overflow-hidden rounded-[28px] bg-[#151515]", className)}>
      {point ? (
        <LeafletMap lat={point.lat} lng={point.lng} zoom={zoom} label={label} onPick={onPick} interactive={interactive} zoomControl={zoomControl} />
      ) : (
        <div className="grid h-full w-full place-items-center px-6 text-center text-sm text-dim">
          {looking ? "Loading map…" : query ? "We couldn't find this address on the map" : "Enter a location above to preview it on the map"}
        </div>
      )}
    </div>
  );
}
