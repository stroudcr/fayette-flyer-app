import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PRICING, getCategory } from "@/lib/directory";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { isPublic, type ListingRow } from "@/lib/guide/content";
import { hasDatabase } from "@/lib/guide/env";
import { allListingsForAdmin } from "@/lib/guide/listings";
import { freeSubmissions } from "@/lib/guide/free-listings";
import { FreeSubmissions } from "./FreeSubmissions";
import { getSession } from "@/lib/guide/session";
import { TONE_CLASSES, describeStatus, formatDate } from "@/lib/guide/status";
import { approveListing, hideListing, rejectListing, sendOwnerSignInLink } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `Guide admin | ${SITE_CONFIG.name}` },
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ done?: string }>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate/70">{label}</dt>
      <dd className="mt-0.5 text-[15px] text-navy">{children}</dd>
    </div>
  );
}

function PendingCard({ listing }: { listing: ListingRow }) {
  const c = listing.content;
  const category = getCategory(listing.category);
  return (
    <li className="rounded-[18px] border border-amber-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-navy">{c.name}</h3>
          <p className="text-sm text-slate/80">
            {category?.heading ?? listing.category} · {c.town} · paid {formatDate(listing.submitted_at)}
          </p>
        </div>
        <Link href={`/directory/manage/${listing.id}/preview`} className="font-medium">
          Preview page <span aria-hidden="true">→</span>
        </Link>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="Address">
          {c.address.street}
          {c.address.suite ? `, ${c.address.suite}` : ""}, {c.address.city} {c.address.zip}
        </Detail>
        <Detail label="Owner">{listing.owner_email}</Detail>
        <Detail label="Phone">{c.phone ?? "—"}</Detail>
        <Detail label="Website">
          {c.website ? (
            <a href={c.website} target="_blank" rel="noopener noreferrer">
              {c.website}
            </a>
          ) : (
            "—"
          )}
        </Detail>
        <Detail label="Plan">
          {listing.plan === "yearly" ? `Yearly ($${PRICING.yearly})` : `Monthly ($${PRICING.monthly})`} · Stripe status: {listing.subscription_status ?? "—"}
        </Detail>
      </dl>
      <div className="mt-5 flex flex-wrap items-start gap-3">
        <form action={approveListing}>
          <input type="hidden" name="id" value={listing.id} />
          <button type="submit" className="btn-primary min-h-11">
            Approve and publish
          </button>
        </form>
        <details className="rounded-lg border border-navy/15 px-4 py-2">
          <summary className="cursor-pointer py-1 font-medium text-red-800">Reject and refund…</summary>
          <form action={rejectListing} className="mt-3 grid gap-2 pb-2">
            <input type="hidden" name="id" value={listing.id} />
            <label htmlFor={`reason-${listing.id}`} className="text-sm font-semibold text-navy">
              Reason (sent to the owner)
            </label>
            <textarea id={`reason-${listing.id}`} name="reason" rows={2} maxLength={300} className="rounded-md border border-navy/20 px-3 py-2 text-[15px]" />
            <button type="submit" className="justify-self-start rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800">
              Reject, cancel and refund
            </button>
          </form>
        </details>
      </div>
    </li>
  );
}

export default async function AdminPage({ searchParams }: Props) {
  const { done } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/directory/manage");
  if (!session.isAdmin) {
    return (
      <main className="flex-1 bg-paper">
        <p className="mx-auto max-w-2xl px-4 py-20 text-lg text-slate">This page is for Fayette Flyer staff.</p>
      </main>
    );
  }
  if (!hasDatabase()) {
    return (
      <main className="flex-1 bg-paper">
        <p className="mx-auto max-w-2xl px-4 py-20 text-lg text-slate">Connect a database to start taking paid listings.</p>
      </main>
    );
  }

  const [listings, freeListings] = await Promise.all([allListingsForAdmin(), freeSubmissions()]);
  const pending = listings.filter((l) => l.status === "pending");
  const others = listings.filter((l) => l.status !== "pending");

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="border-t-[3px] border-navy pt-6 [border-top-style:double]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">Local Business Guide</span>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,5vw,3.2rem)] font-semibold leading-tight text-navy">Review business listings</h1>
          <p className="mt-1 text-sm text-slate/80">
            Signed in as {session.email} ·{" "}
            <Link href="/directory/manage" className="font-medium">
              Owner view
            </Link>
          </p>
        </div>

        {done && (
          <p role="status" className="mt-6 rounded-xl border border-navy/15 bg-white px-4 py-3 text-[15px] text-navy">
            {done}
          </p>
        )}

        <FreeSubmissions listings={freeListings} />
        <section className="mt-10">
          <h2 className="font-serif text-3xl font-semibold text-navy">
            Featured listings to review <span className="font-mono text-xl text-slate/70">({pending.length})</span>
          </h2>
          {pending.length === 0 ? (
            <p className="mt-3 text-slate">Nothing to review right now.</p>
          ) : (
            <ul className="mt-5 grid gap-5">
              {pending.map((listing) => (
                <PendingCard key={listing.id} listing={listing} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl font-semibold text-navy">All featured listings</h2>
          {others.length === 0 ? (
            <p className="mt-3 text-slate">No other listings yet.</p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-navy/[0.12] bg-white">
              <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b border-navy/10 text-[11px] uppercase tracking-[0.16em] text-slate/70">
                    <th scope="col" className="px-4 py-3 font-semibold">Business</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Plan</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Owner</th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {others.map((listing) => {
                    const status = describeStatus(listing);
                    return (
                      <tr key={listing.id} className="border-b border-navy/10 align-top last:border-b-0">
                        <td className="px-4 py-3">
                          <span className="font-serif text-lg font-semibold text-navy">{listing.content.name}</span>
                          <span className="block text-sm text-slate/80">{getCategory(listing.category)?.heading ?? listing.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${TONE_CLASSES[status.tone]}`}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {listing.plan}
                          {listing.current_period_end && <span className="block text-slate/70">to {formatDate(listing.current_period_end)}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">{listing.owner_email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            <Link href={isPublic(listing) ? `/directory/${listing.category}/${listing.slug}` : `/directory/manage/${listing.id}/preview`}>
                              {isPublic(listing) ? "View" : "Preview"}
                            </Link>
                            {listing.status !== "rejected" && listing.status !== "canceled" && <Link href={`/directory/manage/${listing.id}`}>Edit</Link>}
                            {listing.status === "live" && (
                              <form action={hideListing}>
                                <input type="hidden" name="id" value={listing.id} />
                                <button type="submit" className="text-navy underline underline-offset-4">
                                  Hide
                                </button>
                              </form>
                            )}
                            {listing.status === "hidden" && (
                              <form action={approveListing}>
                                <input type="hidden" name="id" value={listing.id} />
                                <button type="submit" className="text-navy underline underline-offset-4">
                                  Show again
                                </button>
                              </form>
                            )}
                            <form action={sendOwnerSignInLink}>
                              <input type="hidden" name="id" value={listing.id} />
                              <button type="submit" className="text-navy underline underline-offset-4">
                                Email sign-in link
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
