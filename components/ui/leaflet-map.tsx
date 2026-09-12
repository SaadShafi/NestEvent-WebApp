"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<div class="nest-marker"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
});

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }, [lat, lng, zoom, map]);
  return null;
}

function ClickPicker({ onPick }: { onPick?: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LeafletMap({
  lat,
  lng,
  zoom,
  label,
  onPick,
  interactive,
}: {
  lat: number;
  lng: number;
  zoom: number;
  label?: string;
  onPick?: (p: { lat: number; lng: number }) => void;
  interactive: boolean;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      style={{ height: "100%", width: "100%" }}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={pinIcon}>
        {label && (
          <Tooltip direction="top" offset={[0, -36]} opacity={1}>
            {label}
          </Tooltip>
        )}
      </Marker>
      <Recenter lat={lat} lng={lng} zoom={zoom} />
      {onPick && <ClickPicker onPick={onPick} />}
    </MapContainer>
  );
}
