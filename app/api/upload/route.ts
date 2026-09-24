import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MAX_BYTES = 25 * 1024 * 1024; // 25MB per file
const ALLOWED = /^(image\/(png|jpe?g|gif|webp|avif)|video\/(mp4|webm|quicktime)|application\/pdf)$/;

function safeName(name: string) {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}-${base}`;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) {
    return NextResponse.json({ error: "No files received" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    return NextResponse.json({ error: "Upload storage is not available" }, { status: 500 });
  }

  const saved: { url: string; name: string; type: string; size: number }[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `${file.name} exceeds 25MB` }, { status: 413 });
    }
    if (file.type && !ALLOWED.test(file.type)) {
      return NextResponse.json({ error: `${file.name}: unsupported type ${file.type}` }, { status: 415 });
    }
    const name = safeName(file.name || "upload");
    const bytes = Buffer.from(await file.arrayBuffer());
    try {
      await writeFile(path.join(dir, name), bytes);
    } catch {
      return NextResponse.json({ error: `Could not save ${file.name}` }, { status: 500 });
    }
    saved.push({ url: `/uploads/${name}`, name: file.name, type: file.type, size: file.size });
  }

  return NextResponse.json({ files: saved });
}
