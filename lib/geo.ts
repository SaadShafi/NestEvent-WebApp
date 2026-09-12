import type { LocationValue } from "./types";

export interface GeoSuggestion {
  id: string;
  label: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  zipcode?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

function pickCity(a: Record<string, string> | undefined) {
  if (!a) return undefined;
  return a.city || a.town || a.village || a.municipality || a.county || a.state;
}

/** Search places via OpenStreetMap Nominatim (no API key). */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeoSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  const res = await fetch(url.toString(), {
    signal,
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return data.map((r) => ({
    id: String(r.place_id),
    label: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
    city: pickCity(r.address),
    country: r.address?.country,
    zipcode: r.address?.postcode,
  }));
}

/** Reverse geocode coordinates into an address. */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeoSuggestion | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  const res = await fetch(url.toString(), { headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  const r = (await res.json()) as NominatimResult;
  if (!r || !r.display_name) return null;
  return {
    id: String(r.place_id),
    label: r.display_name,
    lat,
    lng,
    city: pickCity(r.address),
    country: r.address?.country,
    zipcode: r.address?.postcode,
  };
}

export function suggestionToLocation(s: GeoSuggestion): LocationValue {
  return {
    address: s.label,
    lat: s.lat,
    lng: s.lng,
    city: s.city,
    country: s.country,
    zipcode: s.zipcode,
  };
}

export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  });
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
