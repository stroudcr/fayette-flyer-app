import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BusinessProfile } from "@/components/directory/BusinessProfile";
import { getCategory } from "@/lib/directory";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { isPublic, normalizeEmail, toBusiness } from "@/lib/guide/content";
import { getListing } from "@/lib/guide/listings";
import { getSession } from "@/lib/guide/session";
import { describeStatus } from "@/lib/guide/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `Preview your listing | ${SITE_CONFIG.name}` },
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

/** The owner's (or an admin's) private preview of a listing that isn't public yet. */
export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/directory/manage");
  const listing = await getListing(id);
  if (!listing || listing.status === "draft") redirect("/directory/manage");
  if (!session.isAdmin && normalizeEmail(listing.owner_email) !== session.email) redirect("/directory/manage");

  const category = getCategory(listing.category);
  if (!category) notFound();
  const status = describeStatus(listing);

  return (
    <main className="flex-1 bg-paper">
      <BusinessProfile
        business={toBusiness(listing)}
        category={category}
        others={[]}
        manage={{ href: `/directory/manage/${listing.id}`, label: "Edit this listing" }}
        banner={
          <div role="status" className="bg-gold/15 px-4 py-3 text-center text-[15px] text-navy">
            <strong className="font-semibold">Preview.</strong>{" "}
            {isPublic(listing) ? "This is how your live page looks." : `Only you can see this page. Status: ${status.label}.`}{" "}
            <Link href={`/directory/manage/${listing.id}`} className="font-medium underline underline-offset-4">
              Back to editing
            </Link>
          </div>
        }
      />
    </main>
  );
}
