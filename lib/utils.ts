export function cn(...parts: Array<string | number | bigint | boolean | null | undefined>) {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function ticketCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "NEST-";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/** Download a data URL or blob URL as a file. */
export function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Upload files to the local upload route; returns public URLs. */
export async function uploadFiles(files: File[] | FileList): Promise<{ url: string; name: string; type: string }[]> {
  const list = Array.from(files);
  if (!list.length) return [];
  const fd = new FormData();
  list.forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Upload failed");
  }
  const data = (await res.json()) as { files: { url: string; name: string; type: string }[] };
  return data.files;
}

export function strongPassword(p: string) {
  return (
    p.length >= 12 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p)
  );
}

export function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
