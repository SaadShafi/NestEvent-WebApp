# NEST — Event Web App

Next.js 16 (App Router) implementation of the NEST event platform for two roles:

- **Guest**: discover events, search & filter, event details with map, cart → checkout → tickets with scannable QR (share / download), social feed, chat, profile, settings.
- **Organizer**: everything a guest has, plus My Events, view event (analytics, tracking links, promo codes, complimentary tickets), create organization (team & roles), and the full create-event wizard (media & AI flyer, attendance model, visibility & password, ticket types & restrictions, guest list, review, boost).

Design source: Figma "Nest Event App" — Guest Flow Web App and Organizer Flow Web App canvases.

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

Sign in with any email / password (demo auth). Pick a role on the first screen; you can switch role later from the avatar menu.

## How things work

| Feature | Implementation |
| --- | --- |
| State / persistence | `lib/store.ts` (zustand, persisted to `localStorage`) |
| Uploads | Drag & drop / click → `POST /api/upload` → files saved to `public/uploads/` |
| Location suggestions | `components/ui/location-input.tsx` → OpenStreetMap Nominatim search, plus "use my location" (browser geolocation + reverse geocode) |
| Maps | `components/ui/map-view.tsx` → Leaflet + OpenStreetMap tiles, orange NEST pin |
| QR tickets | `components/ui/qr-code.tsx` → `qrcode` renders the ticket code; "Download QR" builds a PNG ticket, "Share Via" uses the Web Share API (file share where supported, link fallback, clipboard fallback) |
| Chat | `app/(app)/messages` — conversations, attachments, emoji, simulated replies |

## Structure

```
app/
  auth/            role select, sign in/up, forgot / OTP / reset
  onboarding/      profile setup, interests
  (app)/           pages inside the sidebar shell (dashboard, search, social, tickets, messages, account, settings, organizer/events)
  (flow)/          full-page "← Back" screens (event details, checkout, ticket QR, create post, wizards…)
  api/upload/      local file upload route
components/
  shell/           AppShell (sidebar + topbar), FlowPage, AuthSplit, SuccessScreen, CreateMenu
  ui/              buttons, form controls, uploader, location input, map, QR, event card, icons
lib/               types, mock data, store, geo helpers, utils
public/            brand logo, Figma-exported images & icons
```
