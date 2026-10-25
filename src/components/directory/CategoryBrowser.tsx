"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { TAGS } from "@/lib/directory/tags";
import type { TagKey } from "@/lib/directory/types";
import { PlaneIcon } from "@/components/PlaneIcon";
import { PhoneIcon } from "./icons";
import { TrackedLink } from "./TrackedLink";

/** A listing prepared on the server for the category page. */
export interface ListingCard {
  slug: string;
  name: string;
  href: string;
  featured: boolean;
  town: string;
  street: string;
  phone?: string;
  tel?: string;
  summary?: string;
  perkTitle?: string;
  tags: TagKey[];
  photo?: { src: string; alt: string };
  claimHref: string;
}

type FilterKey = TagKey | "perk";

interface CategoryBrowserProps {
  listings: ListingCard[];
  /** e.g. "All chiropractors, A to Z" */
  listHeading: string;
  /** Shown in place of the listings when the category has none. */
  emptyState: ReactNode;
  /** Rendered under the listings in the main column. */
  afterList?: ReactNode;
  /** Rendered in the sidebar under the filters. */
  sidebar?: ReactNode;
}

export function CategoryBrowser({ listings, listHeading, emptyState, afterList, sidebar }: CategoryBrowserProps) {
  const formId = useId();
  const [selected, setSelected] = useState<FilterKey[]>([]);

  const filterOptions = useMemo(() => {
    const options: { key: FilterKey; label: string }[] = [];
    if (listings.some((l) => l.perkTitle)) options.push({ key: "perk", label: "Has a Flyer Perk" });
    for (const [key, label] of Object.entries(TAGS) as [TagKey, string][]) {
      if (listings.some((l) => l.tags.includes(key))) options.push({ key, label });
    }
    return options;
  }, [listings]);

  const visible = listings.filter((l) =>
    selected.every((key) => (key === "perk" ? Boolean(l.perkTitle) : l.tags.includes(key)))
  );
  const featured = visible.filter((l) => l.featured);
  const others = visible.filter((l) => !l.featured);
  const showFilters = listings.length >= 2 && filterOptions.length > 0;

  function toggle(key: FilterKey) {
    setSelected((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  }

  return (
    <div className="flex flex-wrap items-start gap-12">
      <div className="min-w-0 flex-[999_1_600px]">
        {listings.length === 0 ? (
          emptyState
        ) : (
          <>
            {selected.length > 0 && (
              <p className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate" aria-live="polite">
                Showing {visible.length} of {listings.length}
                <button type="button" onClick={() => setSelected([])} className="font-medium text-navy underline underline-offset-4">
                  Clear filters
                </button>
              </p>
            )}

            {featured.length > 0 && (
              <>
                <h2 className="mb-4 !font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">Featured members</h2>
                <ul className="space-y-[18px]">
                  {featured.map((listing) => (
                    <li key={listing.slug}>
                      <FeaturedCard listing={listing} />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {others.length > 0 && (
              <>
                <h2 className={`font-serif text-3xl font-semibold text-navy ${featured.length > 0 ? "mt-12" : ""}`}>{listHeading}</h2>
                <p className="mb-4 mt-1.5 text-[15px] text-slate/80">
                  Free listings, checked by the Flyer. Owners can claim theirs to add photos and hours.
                </p>
                <ol className="border-t border-navy/15">
                  {others.map((listing, index) => (
                    <li
                      key={listing.slug}
                      className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-navy/15 py-[18px]"
                    >
                      <span className="font-mono text-[13px] font-semibold text-gold-ink">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <Link href={listing.href} className="font-serif text-xl font-semibold">
                          {listing.name}
                        </Link>
                        <div className="mt-0.5 text-sm text-slate/80">
                          {listing.town} · {listing.street}
                          {listing.phone && listing.tel && (
                            <>
                              {" · "}
                              <TrackedLink href={listing.tel} business={listing.slug} action="call">
                                {listing.phone}
                              </TrackedLink>
                            </>
                          )}
                        </div>
                      </div>
                      <a href={listing.claimHref} className="text-[13px] font-medium !text-gold-ink">
                        Claim
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {visible.length === 0 && (
              <p className="rounded-2xl border border-dashed border-navy/25 p-6 text-slate">
                Nothing matches those filters yet.{" "}
                <button type="button" onClick={() => setSelected([])} className="font-medium text-navy underline underline-offset-4">
                  Clear filters
                </button>
              </p>
            )}
          </>
        )}

        {afterList}
      </div>

      <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-5">
        {showFilters && (
          <form id={formId} className="rounded-2xl border border-navy/[0.12] bg-white px-6 py-[22px]" onSubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend className="mb-3 font-serif text-xl font-semibold text-navy">Narrow it down</legend>
              <div className="grid gap-1">
                {filterOptions.map((option) => (
                  <label key={option.key} className="flex min-h-10 cursor-pointer items-center gap-3 text-[15px]">
                    <input
                      type="checkbox"
                      checked={selected.includes(option.key)}
                      onChange={() => toggle(option.key)}
                      className="h-[18px] w-[18px] accent-navy"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </form>
        )}
        {sidebar}
      </aside>
    </div>
  );
}

function FeaturedCard({ listing }: { listing: ListingCard }) {
  return (
    <article className="flex flex-wrap overflow-hidden rounded-2xl border border-navy/[0.12] bg-white">
      <div className="relative flex min-h-[200px] flex-[1_1_220px] items-center justify-center bg-[linear-gradient(135deg,#24275e,#151639)]">
        {listing.photo ? (
          <Image src={listing.photo.src} alt={listing.photo.alt} fill sizes="(max-width: 768px) 100vw, 280px" className="object-cover" />
        ) : (
          <PlaneIcon className="h-10 w-10 rotate-45 text-gold" />
        )}
      </div>
      <div className="min-w-0 flex-[999_1_340px] px-7 py-[26px]">
        <span className="sponsor-label">Featured member</span>
        <h3 className="mt-2.5 font-serif text-[26px] font-semibold text-navy">
          <Link href={listing.href}>{listing.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-slate/80">
          {listing.town} · {listing.street}
        </p>
        {listing.summary && <p className="mt-3 leading-[26px]">{listing.summary}</p>}
        {(listing.perkTitle || listing.tags.length > 0) && (
          <p className="mt-3.5 flex flex-wrap gap-2">
            {listing.perkTitle && (
              <span className="rounded-md border border-dashed border-gold px-2.5 py-1 text-xs font-medium text-navy">
                Flyer Perk: {listing.perkTitle}
              </span>
            )}
            {listing.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-md bg-navy/[0.06] px-2.5 py-1 text-xs font-medium text-navy">
                {TAGS[tag]}
              </span>
            ))}
          </p>
        )}
        <div className="mt-[18px] flex flex-wrap items-center gap-4">
          {listing.phone && listing.tel && (
            <TrackedLink
              href={listing.tel}
              business={listing.slug}
              action="call"
              className="btn-primary inline-flex min-h-11 items-center gap-2 !px-5 text-[15px] !text-white"
            >
              <PhoneIcon className="h-4 w-4" />
              Call {listing.phone}
            </TrackedLink>
          )}
          <Link href={listing.href} className="text-[15px] font-medium">
            Read the profile <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
