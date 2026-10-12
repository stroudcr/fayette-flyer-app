import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd, SubscribeForm } from "@/components";
import { getRecentIssueHtml } from "@/lib/beehiiv/posts";
import {
  listingToEventSchema,
  todayIn,
  upcomingListings,
  type Listing,
} from "@/lib/issue-listings";
import { SITE_CONFIG } from "@/lib/seo/constants";
import {
  dateParts,
  formatClock,
  groupByDay,
  relativeLabel,
  townFrom,
} from "@/lib/listing-format";
import { BoardingPass } from "@/components/BoardingPass";
import { PlaneIcon } from "@/components/PlaneIcon";

export const revalidate = 300;

const TIME_ZONE = SITE_CONFIG.location.timeZone;
const PAGE_URL = `${SITE_CONFIG.url}/fayette-county-events`;
const TITLE = "Fayette County Events This Week | Things to Do in Peachtree City & Fayetteville";
const DESCRIPTION =
  "Things to do in Fayette County, GA this week: festivals, farmers markets, live music, library programs, and public meetings in Peachtree City, Fayetteville, Tyrone, Brooks, and Woolsey. Updated with every Fayette Flyer issue.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: SITE_CONFIG.name,
    title: "Things to Do in Fayette County This Week",
    description: DESCRIPTION,
    images: [{ url: SITE_CONFIG.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Things to Do in Fayette County This Week",
    description: DESCRIPTION,
    images: [SITE_CONFIG.defaultOgImage],
  },
};

/* ---------- small pieces ---------- */

function PinIcon() {
  return (
    <svg className="mt-[3px] h-4 w-4 shrink-0 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.75-5.4-6.75-11.25a6.75 6.75 0 1 1 13.5 0C18.75 15.6 12 21 12 21Z" />
      <circle cx="12" cy="9.75" r="2.25" />
    </svg>
  );
}

function TimeColumn({ listing }: { listing: Listing }) {
  if (!listing.startTime) {
    return (
      <div className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-navy">
        All day
      </div>
    );
  }
  const start = formatClock(listing.startTime);
  const end = listing.endTime ? formatClock(listing.endTime) : null;
  return (
    <div className="font-mono tabular-nums text-navy">
      <div className="text-2xl font-semibold leading-none tracking-tight">
        {start.clock}
        <span className="ml-1 text-xs font-semibold tracking-[0.12em] text-gold">{start.meridiem}</span>
      </div>
      {end && (
        <div className="mt-1.5 whitespace-nowrap text-xs uppercase tracking-[0.12em] text-slate/70">
          to {end.clock} {end.meridiem}
        </div>
      )}
    </div>
  );
}

function EventCard({ listing, day }: { listing: Listing; day: string }) {
  const town = townFrom(listing.whereText);
  // "October 12–15" or "Monday through Thursday" is a run of days;
  // "October 13, and Thursday, October 15" is two separate dates.
  const isContinuousRun = /\b(?:through|thru)\b|[a-z]\.?\s+\d{1,2}\s*[–—-]\s*\d{1,2}\b(?!:)/i.test(
    listing.whenText
  );
  const runsThrough =
    listing.endDate > day
      ? (() => {
          const p = dateParts(listing.endDate);
          const date = `${p.weekdayShort}, ${p.monthShort} ${p.day}`;
          return isContinuousRun ? `Runs through ${date}` : `Also ${date}`;
        })()
      : null;

  return (
    <li className="group relative overflow-hidden rounded-xl border border-navy/10 bg-white shadow-[0_1px_0_rgba(28,30,77,0.04)] transition hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-[0_14px_30px_-18px_rgba(28,30,77,0.45)]">
      <div className="grid sm:grid-cols-[8.5rem_1fr]">
        {/* Ticket stub with the time */}
        <div className="relative flex items-center gap-3 border-b border-dashed border-navy/15 bg-paper/70 px-5 py-4 sm:block sm:border-b-0 sm:border-r sm:px-5 sm:py-6">
          <TimeColumn listing={listing} />
          {/* perforation notches */}
          <span className="absolute -right-2 -top-2 hidden h-4 w-4 rounded-full border border-navy/10 bg-paper sm:block" aria-hidden="true" />
          <span className="absolute -bottom-2 -right-2 hidden h-4 w-4 rounded-full border border-navy/10 bg-paper sm:block" aria-hidden="true" />
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {town && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {town}
              </span>
            )}
            {runsThrough && (
              <span className="rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-navy">
                {runsThrough}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl font-semibold leading-snug text-navy sm:text-[1.4rem]">
            {listing.url ? (
              <a href={listing.url} target="_blank" rel="noopener" className="decoration-gold decoration-2 underline-offset-4 group-hover:underline">
                {listing.title}
              </a>
            ) : (
              listing.title
            )}
          </h3>

          {listing.whatText && (
            <p className="mt-2.5 text-[0.98rem] leading-7 text-slate">{listing.whatText}</p>
          )}

          {listing.whereText && (
            <p className="mt-3.5 flex gap-2 text-sm leading-6 text-slate/80">
              <PinIcon />
              <span>{listing.whereText}</span>
            </p>
          )}

          {/* Keep the original wording available for odd schedules ("each evening", "check-in at…"). */}
          <p className="sr-only">When: {listing.whenText}</p>
        </div>
      </div>
    </li>
  );
}

function MeetingRow({ listing }: { listing: Listing }) {
  const p = dateParts(listing.startDate);
  const time = listing.startTime ? formatClock(listing.startTime) : null;
  return (
    <li className="grid gap-3 py-6 sm:grid-cols-[9rem_1fr] sm:gap-8">
      <div className="font-mono text-sm uppercase tracking-[0.12em] text-gold">
        <div className="font-semibold text-white">
          {p.weekdayShort} {p.monthShort} {p.day}
        </div>
        {time && (
          <div className="mt-1 text-gold">
            {time.clock} {time.meridiem}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold leading-snug text-white sm:text-xl">
          {listing.url ? (
            <a
              href={listing.url}
              target="_blank"
              rel="noopener"
              className="!text-white decoration-gold decoration-2 underline-offset-4 hover:underline"
            >
              {listing.title}
            </a>
          ) : (
            listing.title
          )}
        </h3>
        {listing.whatText && <p className="mt-2 leading-7 text-white/75">{listing.whatText}</p>}
        {listing.whereText && <p className="mt-2 text-sm text-white/55">{listing.whereText}</p>}
      </div>
    </li>
  );
}

/* ---------- page ---------- */

export default async function FayetteCountyEventsPage() {
  const today = todayIn(TIME_ZONE);
  let issues: { html: string | undefined; publishDate: Date }[] = [];

  try {
    issues = await getRecentIssueHtml(4);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch issues for events page:", error);
    }
  }

  const listings = upcomingListings(issues, today);
  const events = listings.filter((l) => l.kind === "event");
  const meetings = listings.filter((l) => l.kind === "meeting");
  const days = groupByDay(events, today);
  const updated = issues[0]?.publishDate;
  const updatedLabel = updated
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: TIME_ZONE }).format(updated)
    : null;
  const weekOf = dateParts(today);

  const eventSchema = {
    "@context": "https://schema.org",
    "@graph": listings.map((listing) => listingToEventSchema(listing, TIME_ZONE)),
  };

  return (
    <main className="flex-1 bg-paper">
      {listings.length > 0 && <JsonLd data={eventSchema} />}

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <Image
            src="/starrs-mill.jpg"
            alt=""
            fill
            quality={70}
            sizes="100vw"
            priority
            className="object-cover object-[60%_center] opacity-60"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,22,57,0.97)_0%,rgba(21,22,57,0.92)_48%,rgba(21,22,57,0.72)_72%,rgba(21,22,57,0.5)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
          <div className="hero-fade-up mb-5 flex items-center gap-3 sm:gap-4">
            <div className="h-px w-10 bg-gold/70 sm:w-16" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90 sm:text-[11px]">
              Fayette County events · Week of {weekOf.monthShort} {weekOf.day}
            </span>
          </div>

          <h1 className="hero-fade-up hero-fade-up-delay-1 max-w-[16ch] font-serif text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1] text-white">
            Things to do in Fayette County this week.
          </h1>

          <p className="hero-fade-up hero-fade-up-delay-2 mt-5 max-w-xl text-base leading-7 text-white/[0.84] sm:text-[1.05rem]">
            Festivals, farmers markets, live music, library programs, and public meetings across
            Peachtree City, Fayetteville, Tyrone, Brooks, and Woolsey. Updated with every issue.
          </p>

          {listings.length > 0 && (
            <dl className="hero-fade-up hero-fade-up-delay-2 mt-8 inline-grid grid-cols-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] text-white backdrop-blur-sm">
              <div className="px-4 py-3 sm:px-6 sm:py-4">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/60">Events</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{events.length}</dd>
              </div>
              <div className="border-l border-dashed border-white/20 px-4 py-3 sm:px-6 sm:py-4">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/60">Meetings</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{meetings.length}</dd>
              </div>
              <div className="border-l border-dashed border-white/20 px-4 py-3 sm:px-6 sm:py-4">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/60">Updated</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-gold">{updatedLabel ?? "—"}</dd>
              </div>
            </dl>
          )}

          <div className="hero-fade-up hero-fade-up-delay-3 mt-8 max-w-xl">
            <p className="mb-3 text-sm font-medium text-white/90">
              Get this calendar in your inbox every Monday and Thursday. Free.
            </p>
            <SubscribeForm variant="hero" theme="inverse" showHelperText={false} campaign="events_page" />
          </div>
        </div>
      </section>

      {/* Day jump bar */}
      {days.length > 0 && (
        <nav
          aria-label="Jump to a day"
          className="sticky top-0 z-20 border-b border-navy/10 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75"
        >
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {days.map(([day]) => {
              const p = dateParts(day);
              const rel = relativeLabel(day, today);
              return (
                <a
                  key={day}
                  href={`#day-${day}`}
                  className="shrink-0 rounded-full border border-navy/15 bg-white px-4 py-1.5 text-sm font-medium !text-navy transition hover:!no-underline hover:border-navy hover:bg-navy hover:!text-white"
                >
                  {rel ?? p.weekdayShort} <span className="font-mono tabular-nums opacity-70">{p.day}</span>
                </a>
              );
            })}
            {meetings.length > 0 && (
              <a
                href="#meetings"
                className="shrink-0 rounded-full border border-gold/50 px-4 py-1.5 text-sm font-medium !text-navy transition hover:!no-underline hover:bg-gold hover:!text-white"
              >
                Public meetings
              </a>
            )}
          </div>
        </nav>
      )}

      {/* Calendar */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {days.length > 0 ? (
          <div className="space-y-14 sm:space-y-20">
            {days.map(([day, dayEvents]) => {
              const p = dateParts(day);
              const rel = relativeLabel(day, today);
              return (
                <section key={day} id={`day-${day}`} className="scroll-mt-20 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-12">
                  <header className="mb-6 flex items-end gap-4 border-b border-navy/10 pb-4 lg:sticky lg:top-24 lg:mb-0 lg:block lg:self-start lg:border-b-0 lg:pb-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                      {rel && <span className="rounded-sm bg-gold px-1.5 py-0.5 text-white">{rel}</span>}
                      <span>{p.weekday}</span>
                    </div>
                    <h2 className="font-serif text-6xl font-semibold leading-none text-navy lg:mt-3 lg:text-[5.5rem]">
                      <span className="sr-only">{p.weekday}, </span>
                      {p.day}
                    </h2>
                    <div className="pb-1 lg:pb-0">
                      <p className="font-serif text-lg italic text-slate lg:mt-1">{p.month}</p>
                      <p className="mt-1 hidden items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate/60 lg:flex">
                        <PlaneIcon className="h-3.5 w-3.5 rotate-90 text-gold" />
                        {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                      </p>
                    </div>
                  </header>

                  <ul className="space-y-4">
                    {dayEvents.map((listing) => (
                      <EventCard key={`${listing.title}-${listing.startDate}`} listing={listing} day={day} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-navy/10 bg-white p-8 text-center sm:p-12">
            <PlaneIcon className="mx-auto h-8 w-8 rotate-45 text-gold" />
            <h2 className="mt-4 font-serif text-3xl font-semibold text-navy">The next calendar is boarding soon.</h2>
            <p className="mt-3 text-lg leading-8 text-slate">
              New events go up as soon as each issue is published. Until then, every recent roundup is in the archive.
            </p>
            <Link href="/issues" className="btn-primary mt-6 inline-block">
              Browse recent issues
            </Link>
          </div>
        )}
      </section>

      {/* Public meetings */}
      {meetings.length > 0 && (
        <section id="meetings" className="scroll-mt-16 bg-navy">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-12 lg:px-8">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold/70" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Civic calendar</span>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Public meetings
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                City, county, and board meetings open to residents. Agendas are linked where posted.
              </p>
            </div>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {meetings.map((listing) => (
                <MeetingRow key={`${listing.title}-${listing.startDate}`} listing={listing} />
              ))}
            </ul>
          </div>
        </section>
      )}

      <BoardingPass />

      {/* Event tips */}
      <section className="border-t border-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-navy">Hosting something in Fayette County?</h2>
            <p className="mt-1 text-slate">
              Send us the date, time, place, and a link. Community events, fundraisers, and school activities are all welcome.
            </p>
          </div>
          <Link href="/contact" className="btn-primary shrink-0 text-center">
            Submit an event
          </Link>
        </div>
      </section>
    </main>
  );
}
