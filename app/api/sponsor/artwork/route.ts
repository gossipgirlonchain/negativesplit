import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { viewerFrom } from "@/lib/auth";
import { BY_NO, TAKE_ALL } from "@/lib/positions";
import { getSold } from "@/lib/sold";
import { getOwnerEmail, submitArtwork } from "@/lib/sponsors";

/* A sponsor uploads a logo and a link for a position they own.
   It always lands pending. Nothing here can publish itself. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const EXTENSION: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  const viewer = await viewerFrom(req);
  if (!viewer) return Response.json({ error: "not signed in" }, { status: 401 });

  const form = await req.formData();
  const no = String(form.get("position") ?? "").trim();
  const brand = String(form.get("brand") ?? "").trim();
  const link = String(form.get("url") ?? "").trim();
  const file = form.get("logo");

  if (!BY_NO[no]) return bad("unknown position");
  if (!brand) return bad("brand name is required");
  if (brand.length > 60) return bad("brand name is too long");

  const safeLink = normalizeUrl(link);
  if (link && !safeLink) return bad("link must be a http or https URL");

  const sold = await getSold();
  if (!sold.has(no) && !sold.has(TAKE_ALL.no)) {
    return bad("that position has not been sold");
  }

  if (!viewer.isAdmin) {
    const owner =
      (await getOwnerEmail(sold.has(TAKE_ALL.no) ? TAKE_ALL.no : no)) ||
      (await getOwnerEmail(no));
    if (owner !== viewer.email) {
      return Response.json({ error: "that is not your position" }, { status: 403 });
    }
  }

  if (!(file instanceof File) || file.size === 0) return bad("a logo file is required");
  if (file.size > MAX_BYTES) return bad("logo must be 2MB or smaller");
  if (!ALLOWED.has(file.type)) {
    return bad("logo must be an SVG, PNG, JPG or WebP");
  }

  const path = `logos/${no}.${EXTENSION[file.type]}`;
  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  await submitArtwork({
    no,
    brand,
    url: safeLink,
    logoUrl: blob.url,
    logoPath: blob.pathname,
  });

  revalidatePath("/");

  return Response.json({
    ok: true,
    status: "pending",
    logoUrl: blob.url,
  });
}

function bad(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

/** Only http(s) survives this. Keeps javascript: and data: off the page. */
function normalizeUrl(input: string): string {
  if (!input) return "";
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}
