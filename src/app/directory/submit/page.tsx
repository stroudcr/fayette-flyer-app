import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_GROUPS, categoriesInGroup } from "@/lib/directory";
import { getGuideBusinesses } from "@/lib/directory/data";
import { DAY_ORDER } from "@/lib/directory/format";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { FreeListingForm } from "./FreeListingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Submit a free business listing | Fayette Flyer" },
  description: "Add your Fayette County business to the Fayette Flyer Local Business Guide. Free listings are reviewed before publication.",
  alternates: { canonical: `${SITE_CONFIG.url}/directory/submit` },
};

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ claim?: string; category?: string }> }) {
  const { claim, category } = await searchParams;
  const business = claim ? (await getGuideBusinesses()).find((b) => b.slug === claim && b.tier === "free") : undefined;
  if (claim && !business) notFound();
  const defaults: Record<string, string> = business ? {
    name: business.name, category: business.category, town: business.town, street: business.address.street,
    suite: business.address.suite ?? "", zip: business.address.zip, phone: business.phone ?? "", website: business.website ?? "",
  } : { category: category ?? "" };
  for (const day of DAY_ORDER) {
    const intervals = business?.hours?.[day];
    defaults[`hours.${day}.mode`] = intervals === undefined ? "" : intervals.length ? "open" : "closed";
    defaults[`hours.${day}.opens`] = intervals?.[0]?.opens ?? "09:00";
    defaults[`hours.${day}.closes`] = intervals?.[0]?.closes ?? "17:00";
  }
  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-[13px] text-slate/80">
          <Link href="/directory">Local Business Guide</Link><span aria-hidden="true" className="mx-2 text-gold">›</span>
          <span aria-current="page">Free listing</span>
        </nav>
        <div className="mb-9 mt-8 border-t-[3px] border-navy pt-6 [border-top-style:double]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">For business owners · Always free</span>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-tight text-navy">{business ? "Claim your listing" : "Get your business listed"}</h1>
          <p className="mt-3 max-w-xl text-[17px] leading-7 text-slate">{business ? `Check the details for ${business.name} and tell us who you are.` : "Help your Fayette County neighbors find you. Add your business details below."} We&apos;ll review your submission before it appears in the guide.</p>
        </div>
        <div className="rounded-[18px] border border-navy/15 bg-white p-5 sm:p-8">
          <FreeListingForm claim={business?.slug ?? ""} defaults={defaults} towns={[...SITE_CONFIG.cities]} categoryGroups={CATEGORY_GROUPS.map((g) => ({ name: g.name, options: categoriesInGroup(g.slug).map((c) => ({ value: c.slug, label: c.heading })) }))} />
        </div>
      </div>
    </main>
  );
}
