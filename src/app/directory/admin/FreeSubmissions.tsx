import Link from "next/link";
import { getCategory } from "@/lib/directory";
import { DAY_LABELS, DAY_ORDER } from "@/lib/directory/format";
import type { FreeSubmission } from "@/lib/guide/free-content";
import { formatDate } from "@/lib/guide/status";
import { approveFreeListing, hideFreeListing, rejectFreeListing } from "./actions";

export function FreeSubmissions({ listings }: { listings: FreeSubmission[] }) {
  const pending = listings.filter((l) => l.status === "pending");
  const reviewed = listings.filter((l) => l.status !== "pending");
  return (
    <section className="mt-10" id="free-submissions">
      <h2 className="font-serif text-3xl font-semibold text-navy">Free listings to review <span className="font-mono text-xl text-slate/70">({pending.length})</span></h2>
      {pending.length === 0 ? <p className="mt-3 text-slate">No free submissions waiting for review.</p> : (
        <ul className="mt-5 grid gap-5">
          {pending.map((listing) => {
            const c = listing.content;
            return (
              <li key={listing.id} className="rounded-[18px] border border-amber-200 bg-white p-6">
                <h3 className="font-serif text-2xl font-semibold text-navy">{c.name}</h3>
                <p className="mt-1 text-sm text-slate">{getCategory(listing.category)?.heading} · {c.town} · {listing.claimed_slug ? "Claim existing listing" : "New free listing"} · {formatDate(listing.created_at)}</p>
                {listing.claimed_slug && <p className="mt-2 text-sm"><Link href={`/directory/${listing.category}/${listing.claimed_slug}`}>Compare with existing listing →</Link></p>}
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="font-semibold text-navy">Contact</dt><dd>{listing.contact_name} ({listing.contact_role})<br />{listing.owner_email}</dd></div>
                  <div><dt className="font-semibold text-navy">Address</dt><dd>{c.address.street}{c.address.suite ? `, ${c.address.suite}` : ""}, {c.town}, GA {c.address.zip}</dd></div>
                  <div><dt className="font-semibold text-navy">Phone</dt><dd>{c.phone ?? "Not provided"}</dd></div>
                  <div><dt className="font-semibold text-navy">Website</dt><dd>{c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="break-all">{c.website}</a> : "Not provided"}</dd></div>
                  <div className="sm:col-span-2"><dt className="font-semibold text-navy">Hours</dt><dd>{c.hours ? DAY_ORDER.filter((d) => c.hours?.[d] !== undefined).map((d) => `${DAY_LABELS[d].short}: ${c.hours![d]!.length ? c.hours![d]!.map((h) => `${h.opens}–${h.closes}`).join(", ") : "Closed"}`).join(" · ") : "Not provided"}</dd></div>
                </dl>
                <p className="mt-4 text-sm text-slate">Confirm the submitter represents this business before approving a claim. Contact details stay private.</p>
                <div className="mt-5 flex flex-wrap items-start gap-3">
                  <form action={approveFreeListing}><input type="hidden" name="id" value={listing.id} /><button type="submit" className="btn-primary min-h-11">Approve and publish</button></form>
                  <details className="rounded-lg border border-navy/15 px-4 py-2"><summary className="cursor-pointer py-1 font-medium text-red-800">Decline submission</summary>
                    <form action={rejectFreeListing} className="mt-3 grid gap-2 pb-2"><input type="hidden" name="id" value={listing.id} /><label htmlFor={`free-reason-${listing.id}`} className="text-sm font-semibold">Reason (emailed to the submitter)</label><textarea id={`free-reason-${listing.id}`} name="reason" rows={2} maxLength={300} className="rounded-md border border-navy/20 px-3 py-2 text-sm" /><button type="submit" className="justify-self-start rounded-md bg-red-700 px-4 py-2 font-medium text-white">Decline</button></form>
                  </details>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {reviewed.length > 0 && <details className="mt-6 rounded-xl border border-navy/15 bg-white p-5"><summary className="cursor-pointer font-semibold text-navy">Reviewed free submissions ({reviewed.length})</summary><ul className="mt-4 grid gap-4">{reviewed.map((l) => <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-3"><div><p className="font-semibold text-navy">{l.content.name}</p><p className="text-sm text-slate">{l.status} · {l.owner_email} · {formatDate(l.reviewed_at)}</p></div>{l.status === "live" && <form action={hideFreeListing}><input type="hidden" name="id" value={l.id} /><button type="submit" className="text-sm text-navy underline">Remove approved submission</button></form>}</li>)}</ul></details>}
    </section>
  );
}
