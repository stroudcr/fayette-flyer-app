import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TAGS, TAG_KEYS, getCategory } from "@/lib/directory";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { MAX_PHOTOS, isPublic, normalizeEmail } from "@/lib/guide/content";
import { getListing } from "@/lib/guide/listings";
import { getSession } from "@/lib/guide/session";
import { TONE_CLASSES, describeStatus } from "@/lib/guide/status";
import { EditListingForm } from "./EditListingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `Edit your listing | ${SITE_CONFIG.name}` },
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/directory/manage");
  const listing = await getListing(id);
  if (!listing || listing.status === "draft") redirect("/directory/manage");
  if (!session.isAdmin && normalizeEmail(listing.owner_email) !== session.email) redirect("/directory/manage");
  if (listing.status === "rejected" || listing.status === "canceled") redirect("/directory/manage");

  const status = describeStatus(listing);
  const category = getCategory(listing.category);
  const live = isPublic(listing);

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-[13px] text-slate/80">
          <Link href="/directory/manage">Your listings</Link>
          <span aria-hidden="true" className="mx-2 text-gold">›</span>
          <span aria-current="page">Edit</span>
        </nav>
        <div className="mt-8 border-t-[3px] border-navy pt-6 [border-top-style:double]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">{category?.heading ?? listing.category}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TONE_CLASSES[status.tone]}`}>{status.label}</span>
          </div>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight text-navy">{listing.content.name}</h1>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
            <Link href={live ? `/directory/${listing.category}/${listing.slug}` : `/directory/manage/${listing.id}/preview`} className="font-medium">
              {live ? "View live page" : "Preview your page"} <span aria-hidden="true">→</span>
            </Link>
            <span className="text-slate/70">
              Category or web address need changing? Email {SITE_CONFIG.email}.
            </span>
          </p>
        </div>

        <div className="mt-10">
          <EditListingForm
            listingId={listing.id}
            content={listing.content}
            towns={[...SITE_CONFIG.cities]}
            tags={TAG_KEYS.map((key) => ({ key, label: TAGS[key] }))}
            maxPhotos={MAX_PHOTOS}
          />
        </div>
      </div>
    </main>
  );
}
