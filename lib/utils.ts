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

type Uploaded = { url: string; name: string; type: string };

const MAX_IMAGE_EDGE = 1600;

/** Downscale / re-encode large photos in the browser so uploads stay small (phone photos are often 5–15 MB). */
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || /gif|svg/.test(file.type) || file.size < 400_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC the browser can't decode — send the original
  }
}

/** Keep a file in the browser when the server can't take it: images as data URLs (survive reloads), videos as blob URLs. */
function localFile(file: File): Promise<Uploaded> {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve({ url: URL.createObjectURL(file), name: file.name, type: file.type || "video/mp4" });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), name: file.name, type: file.type });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload files to the local upload route; returns their URLs. Photos are compressed first, and if
 * the server rejects the upload (size limit, read-only disk, offline…) the files are kept in the
 * browser instead so the user can carry on (e.g. Create Post).
 */
export async function uploadFiles(files: File[] | FileList): Promise<Uploaded[]> {
  const list = await Promise.all(Array.from(files).map(shrinkImage));
  if (!list.length) return [];
  const fd = new FormData();
  list.forEach((f) => fd.append("files", f));
  try {
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    const data = (await res.json()) as { files: Uploaded[] };
    return data.files;
  } catch {
    return Promise.all(list.map(localFile));
  }
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
