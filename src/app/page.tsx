import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd, SubscribeForm } from "@/components";
import { BoardingPass } from "@/components/BoardingPass";
import { PlaneIcon } from "@/components/PlaneIcon";
import { getLatestIssues, getRecentIssueHtml } from "@/lib/beehiiv/posts";
import type { Issue } from "@/lib/beehiiv/types";
import { displayDay, todayIn, upcomingListings, type Listing } from "@/lib/issue-listings";
import { dateParts, formatClock, relativeLabel, townFrom } from "@/lib/listing-format";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { generateWebsiteSchema } from "@/lib/seo/schemas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Fayette County News | Local Updates from Peachtree City, Fayetteville & More",
  description:
    "Get free twice-a-week Fayette County GA news delivered to your inbox. Covering Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey local news, events, and community updates.",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

const TIME_ZONE = SITE_CONFIG.location.timeZone;

/* ---------- helpers ---------- */

/** "A, B, and C. Local Fayette County News." → ["A", "B", "C"] */
function headlinesFrom(subtitle?: string): string[] {
  if (!subtitle) return [];
  const cleaned = subtitle
    .replace(/\s*Local Fayette County News\.?\s*$/i, "")
    .replace(/\.\s*$/, "")
    .trim();
  return cleaned
    .split(/,\s+(?:and\s+)?(?=[A-Z0-9“"'])/)
    .map((h) => h.trim())
    .filter(Boolean);
}

/** Drops the leading emoji from issue titles like "✈️ WOW Everyone Is So". */
function plainTitle(title: string): string {
  return title.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function editionDate(date: Date, style: "long" | "short") {
  return new Intl.DateTimeFormat(
    "en-US",
    style === "long"
      ? { weekday: "long", month: "long", day: "numeric", timeZone: TIME_ZONE }
      : { weekday: "short", month: "short", day: "numeric", timeZone: TIME_ZONE }
  ).format(date);
}

function nowClock(): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  }).format(new Date());
}

/** The next few events that haven't already finished today. */
function nextEvents(listings: Listing[], today: string, count: number): Listing[] {
  const now = nowClock();
  return listings
    .filter((l) => l.kind === "event")
    .filter((l) => {
      if (l.startDate !== today || l.endDate !== today) return true;
      const finish = l.endTime ?? l.startTime;
      return !finish || finish >= now;
    })
    .slice(0, count);
}

/* ---------- page ---------- */

export default async function HomePage() {
  let latestIssues: Issue[] = [];
  let listings: Listing[] = [];
  const today = todayIn(TIME_ZONE);

  const [issuesResult, htmlResult] = await Promise.allSettled([
    getLatestIssues(6),
    getRecentIssueHtml(4),
  ]);

  if (issuesResult.status === "fulfilled") {
    latestIssues = issuesResult.value;
  } else if (process.env.NODE_ENV === "development") {
    console.error("Failed to fetch issues:", issuesResult.reason);
  }

  if (htmlResult.status === "fulfilled") {
    listings = upcomingListings(htmlResult.value, today);
  } else if (process.env.NODE_ENV === "development") {
    console.error("Failed to fetch events:", htmlResult.reason);
  }

  const featured = latestIssues[0] ?? null;
  const featuredHeadlines = headlinesFrom(featured?.subtitle);
  const recent = latestIssues.slice(1, 5);
  const upcoming = nextEvents(listings, today, 6);
  const eventCount = listings.filter((l) => l.kind === "event").length;

  return (
    <main className="flex-1 bg-paper">
      <JsonLd data={generateWebsiteSchema()} />

      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <div className="hero-image-drift absolute inset-0">
            <Image
              src="/starrs-mill.jpg"
              alt="Starr's Mill, a historic Fayette County landmark"
              fill
              quality={75}
              sizes="100vw"
              priority
              className="object-cover object-[58%_center]"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,22,57,0.96)_0%,rgba(21,22,57,0.9)_42%,rgba(21,22,57,0.66)_64%,rgba(21,22,57,0.32)_82%,rgba(21,22,57,0.14)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,22,57,0.15)_0%,rgba(21,22,57,0)_30%,rgba(21,22,57,0.35)_100%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl text-white">
            <div className="hero-fade-up mb-6 flex items-center gap-3 sm:gap-4">
              <div className="h-px w-10 bg-gold/70 sm:w-16" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90 sm:text-[11px]">
                Fayette County, Georgia
              </span>
            </div>

            <p className="hero-fade-up hero-fade-up-delay-1 mb-3 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-black uppercase tracking-[0.08em] text-white/95">
              The Fayette Flyer
            </p>

            <h1 className="hero-fade-up hero-fade-up-delay-2 max-w-[11ch] font-serif text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[0.92] text-white drop-shadow-[0_2px_18px_rgba(12,14,34,0.3)]">
              First Class Local News
            </h1>

            <p className="hero-fade-up hero-fade-up-delay-2 mt-6 max-w-lg text-base leading-7 text-white/[0.86] sm:text-[1.08rem] sm:leading-8">
              The decisions, openings, games, and good news shaping Peachtree City,
              Fayetteville, Tyrone, Brooks, and Woolsey.
            </p>

            <div id="subscribe" className="hero-fade-up hero-fade-up-delay-3 mt-7 max-w-xl">
              <SubscribeForm variant="hero" theme="inverse" showHelperText={false} campaign="homepage_hero" />
            </div>

            {/* Ticket strip */}
            <dl className="hero-fade-up hero-fade-up-delay-3 mt-7 inline-grid grid-cols-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-sm">
              <div className="px-4 py-3 sm:px-6">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/55">Departs</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-white sm:text-base">Mon · Thu</dd>
              </div>
              <div className="border-l border-dashed border-white/20 px-4 py-3 sm:px-6">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/55">Fare</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-gold sm:text-base">Free</dd>
              </div>
              <div className="border-l border-dashed border-white/20 px-4 py-3 sm:px-6">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/55">On board</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-white sm:text-base">1,900+</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- Latest edition ---------- */}
      {featured && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold/70" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                  Latest edition · {editionDate(featured.publishDate, "long")}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-2xl italic text-slate sm:text-[1.7rem]">
                {plainTitle(featured.title)}
              </h2>

              {featuredHeadlines.length > 1 ? (
                <ol className="mt-8 border-t border-navy/10">
                  {featuredHeadlines.map((headline, i) => (
                    <li key={headline} className="flex gap-5 border-b border-navy/10 py-5 sm:gap-7 sm:py-6">
                      <span className="pt-1 font-mono text-sm font-semibold tabular-nums text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-serif text-xl font-semibold leading-snug text-navy sm:text-[1.65rem]">
                        {headline}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                featured.excerpt && <p className="mt-6 text-lg leading-8 text-slate">{featured.excerpt}</p>
              )}

              <Link href={`/issues/${featured.slug}`} className="btn-primary mt-8 inline-flex items-center gap-2 !text-white">
                Read the full edition
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <Link
              href={`/issues/${featured.slug}`}
              className="group relative block self-start overflow-hidden rounded-2xl bg-navy shadow-[0_30px_60px_-34px_rgba(21,22,57,0.7)]"
              aria-label={`Read the ${editionDate(featured.publishDate, "long")} edition`}
            >
              {featured.thumbnailUrl ? (
                <Image
                  src={featured.thumbnailUrl}
                  alt=""
                  width={900}
                  height={700}
                  quality={75}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center">
                  <PlaneIcon className="h-14 w-14 rotate-45 text-gold" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[linear-gradient(0deg,rgba(21,22,57,0.92),rgba(21,22,57,0))] px-5 pb-4 pt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-white/85">
                <span>{editionDate(featured.publishDate, "short")}</span>
                <span className="text-gold">Now boarding</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ---------- Coming up around the county ---------- */}
      {upcoming.length > 0 && (
        <section className="border-y border-navy/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <PlaneIcon className="h-4 w-4 rotate-90 text-gold" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Departures</span>
                </div>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-navy sm:text-4xl">
                  Coming up around the county
                </h2>
              </div>
              <Link href="/fayette-county-events" className="shrink-0 font-medium text-navy">
                All {eventCount} events this week <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ul className="grid gap-4 md:grid-cols-2">
              {upcoming.map((listing) => {
                const day = displayDay(listing, today);
                const p = dateParts(day);
                const rel = relativeLabel(day, today);
                const time = listing.startTime ? formatClock(listing.startTime) : null;
                const town = townFrom(listing.whereText);
                return (
                  <li key={`${listing.title}-${listing.startDate}`}>
                    <Link
                      href={`/fayette-county-events#day-${day}`}
                      className="group grid h-full grid-cols-[6.5rem_1fr] overflow-hidden rounded-xl border border-navy/10 bg-paper/60 transition hover:-translate-y-0.5 hover:border-navy/20 hover:bg-white hover:!no-underline hover:shadow-[0_14px_30px_-18px_rgba(28,30,77,0.45)]"
                    >
                      <div className="border-r border-dashed border-navy/15 px-4 py-4 font-mono">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                          {rel ?? p.weekdayShort}
                        </div>
                        <div className="mt-1 text-lg font-semibold tabular-nums leading-none text-navy">
                          {time ? time.clock : "All"}
                          <span className="ml-0.5 text-[10px] text-gold">{time ? time.meridiem : "day"}</span>
                        </div>
                      </div>
                      <div className="px-4 py-4">
                        {town && (
                          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate/60">{town}</div>
                        )}
                        <div className="mt-1 font-serif text-lg font-semibold leading-snug text-navy group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                          {listing.title}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Recent editions ---------- */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl font-semibold text-navy sm:text-4xl">Recent editions</h2>
            <Link href="/issues" className="shrink-0 font-medium text-navy">
              Full archive <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="border-t border-navy/15">
            {recent.map((issue) => {
              const headlines = headlinesFrom(issue.subtitle);
              return (
                <li key={issue.id}>
                  <Link
                    href={`/issues/${issue.slug}`}
                    className="group grid gap-2 border-b border-navy/15 py-6 transition hover:bg-white hover:!no-underline sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-8 sm:px-3"
                  >
                    <time
                      dateTime={issue.publishDate.toISOString()}
                      className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold"
                    >
                      {editionDate(issue.publishDate, "short")}
                    </time>
                    <div>
                      <p className="font-serif text-xl font-semibold leading-snug text-navy group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                        {headlines[0] ?? plainTitle(issue.title)}
                      </p>
                      {headlines.length > 1 && (
                        <p className="mt-1.5 text-[0.95rem] leading-7 text-slate/80">
                          Plus: {headlines.slice(1).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="hidden font-mono text-navy/40 transition group-hover:translate-x-1 group-hover:text-gold sm:block" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ---------- Why the Flyer ---------- */}
      <section className="border-t border-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gold/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Why the Flyer</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-navy sm:text-[2.6rem]">
              Your neighbors, covering your neighbors.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-slate">
              Written here, for here. No paywall and no national filler, just what&apos;s happening down the road.
            </p>
            <Link href="/about" className="mt-6 inline-block font-medium text-navy">
              About the Flyer <span aria-hidden="true">→</span>
            </Link>
          </div>

          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 sm:grid-cols-3 lg:mt-0 lg:grid-cols-1">
            {[
              ["City hall & schools", "Council votes, zoning, school board decisions, and the meetings where they happen."],
              ["Openings & development", "New restaurants, shops, and projects, from Trilith to the Fayette Pavilion."],
              ["Games & good news", "Friday night scores, student wins, and neighbors doing good work."],
            ].map(([title, body], i) => (
              <div key={title} className="flex gap-5 bg-white p-6 sm:block lg:flex">
                <span className="font-mono text-sm font-semibold tabular-nums text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="sm:mt-3 lg:mt-0">
                  <dt className="font-serif text-xl font-semibold text-navy">{title}</dt>
                  <dd className="mt-1.5 leading-7 text-slate">{body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <BoardingPass campaign="homepage" />
    </main>
  );
}
