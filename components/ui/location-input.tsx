"use client";

import { useEffect, useRef, useState } from "react";
import { getCurrentPosition, reverseGeocode, searchPlaces, suggestionToLocation, type GeoSuggestion } from "@/lib/geo";
import type { LocationValue } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconPin, IconTarget } from "./icons";
import { Spinner } from "./primitives";
import { useToast } from "./toast";

/**
 * Location input with live suggestions (OpenStreetMap Nominatim) and a
 * "use my current location" button. Selecting a suggestion yields lat/lng
 * so a map can render the chosen place.
 */
export function LocationInput({
  value,
  onChange,
  placeholder = "Enter Location",
  className,
  icon = "target",
}: {
  value: LocationValue | null;
  onChange: (v: LocationValue | null) => void;
  placeholder?: string;
  className?: string;
  icon?: "target" | "search";
}) {
  const [text, setText] = useState(value?.address ?? "");
  const [items, setItems] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Keep the text in sync when the controlled value changes from outside
  // (derived-state pattern: adjust during render instead of in an effect).
  const [prevAddress, setPrevAddress] = useState(value?.address ?? "");
  if ((value?.address ?? "") !== prevAddress) {
    setPrevAddress(value?.address ?? "");
    setText(value?.address ?? "");
  }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = text.trim();
    const tooShort = q.length < 2 || q === value?.address;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const t = setTimeout(async () => {
      if (tooShort) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await searchPlaces(q, ctrl.signal);
        if (!ctrl.signal.aborted) setItems(res);
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, tooShort ? 0 : 320);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [text, open, value?.address]);

  const pick = (s: GeoSuggestion) => {
    onChange(suggestionToLocation(s));
    setText(s.label);
    setItems([]);
    setOpen(false);
  };

  const locate = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      const s = await reverseGeocode(pos.lat, pos.lng);
      if (s) pick(s);
      else onChange({ address: `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`, ...pos });
      toast("Location detected", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not get your location", "error");
    } finally {
      setLocating(false);
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="flex h-13 items-center rounded-full bg-surface pl-5 pr-3">
        {icon === "search" && <IconPin size={18} className="mr-2 text-accent" />}
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && items[0]) {
              e.preventDefault();
              pick(items[0]);
            }
          }}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-[14px] text-text placeholder:text-dim"
          autoComplete="off"
        />
        {loading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <button
            type="button"
            onClick={locate}
            className="grid h-9 w-9 place-items-center rounded-full text-text hover:bg-surface-3"
            title="Use my current location"
            aria-label="Use my current location"
          >
            {locating ? <Spinner className="h-4 w-4" /> : <IconTarget size={20} />}
          </button>
        )}
      </div>
      {open && items.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-auto rounded-[20px] border border-border bg-[#141414] p-2 shadow-2xl">
          {items.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="flex w-full items-start gap-3 rounded-[14px] px-3 py-2.5 text-left hover:bg-surface"
              >
                <IconPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <span className="text-sm text-text">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
