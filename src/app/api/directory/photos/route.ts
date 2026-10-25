import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { normalizeEmail } from "@/lib/guide/content";
import { getListing } from "@/lib/guide/listings";
import { getSession } from "@/lib/guide/session";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // under Vercel's 4.5 MB request limit
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Uploads one listing photo to Vercel Blob. The photo is attached when the owner saves. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const listingId = form?.get("listingId");
  const file = form?.get("file");
  if (typeof listingId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "No photo received." }, { status: 400 });
  }

  const listing = await getListing(listingId);
  if (!listing || (!session.isAdmin && normalizeEmail(listing.owner_email) !== session.email)) {
    return NextResponse.json({ error: "You can't edit this listing." }, { status: 403 });
  }

  const extension = TYPES[file.type];
  if (!extension) return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That photo is over 4 MB. Try a smaller one." }, { status: 400 });

  try {
    const blob = await put(`guide/${listing.id}/${listing.slug}.${extension}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[guide photos] Upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
