/**
 * Pulls event and public-meeting listings out of published newsletter HTML.
 *
 * The newsletter already formats every listing the same way:
 *
 *   <a href="source">Title</a>
 *   When: Monday, October 12, 6:30 PM – 8:30 PM
 *   What: ...
 *   Where: Venue, 123 Street, Town, GA 30000
 *
 * under a "WHAT'S HAPPENIN'" (events) or "CIVIL NEWS" (meetings) heading.
 * This module turns that into structured listings so the site can show a
 * calendar that refreshes every time an issue is published.
 */

export type ListingKind = "event" | "meeting";

export interface Listing {
  kind: ListingKind;
  title: string;
  url?: string;
  whenText: string;
  whatText?: string;
  whereText?: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD (same as startDate for one-day listings) */
  endDate: string;
  /** HH:MM, 24-hour */
  startTime?: string;
  /** HH:MM, 24-hour */
  endTime?: string;
}

interface Block {
  type: "heading" | "block";
  text: string;
  links: { url: string; text: string }[];
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const DAY_HEADING =
  /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|upcoming|this weekend|the weekend|weekend|later this week|next week|coming up)$/i;

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&ndash;": "–",
  "&mdash;": "—",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&rdquo;": "”",
  "&ldquo;": "“",
  "&hellip;": "…",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity);
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function cleanLine(value: string): string {
  return value.replace(/[ \t ]+/g, " ").trim();
}

/** Removes tracking parameters so outbound links stay clean. */
export function cleanUrl(raw: string): string {
  const url = decodeEntities(raw.trim());
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|_bhiiv$|fbclid$|gclid$)/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Flattens newsletter HTML into an ordered list of headings and text blocks. */
export function htmlToBlocks(html: string): Block[] {
  let working = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ");

  working = working.replace(
    /<a\b[^>]*?href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi,
    (_, _q, href, inner) => `\u0001${href}\u0002${stripTags(inner)}\u0003`
  );

  working = working.replace(
    /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_, _level, inner) => `\u0004H${stripTags(inner).replace(/[\u0001-\u0003]/g, "").replace(/\n/g, " ")}\u0004`
  );

  working = working
    // A blank line (two or more line breaks) separates listings that share one paragraph.
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "\u0004B\u0004")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|td|tr|table|ul|ol|blockquote|section)>/gi, "\u0004B\u0004")
    .replace(/<[^>]+>/g, "");

  const blocks: Block[] = [];

  for (const part of working.split("\u0004")) {
    if (!part || part === "B") continue;

    if (part.startsWith("H")) {
      const text = cleanLine(decodeEntities(part.slice(1)));
      if (text) blocks.push({ type: "heading", text, links: [] });
      continue;
    }

    const links: Block["links"] = [];
    const text = part.replace(/\u0001([^\u0002]*)\u0002([^\u0003]*)\u0003/g, (_, url, linkText) => {
      const cleanText = cleanLine(decodeEntities(linkText));
      links.push({ url: cleanUrl(url), text: cleanText });
      return linkText;
    });

    const normalized = decodeEntities(text)
      .split("\n")
      .map(cleanLine)
      .filter(Boolean)
      .join("\n");

    if (normalized) blocks.push({ type: "block", text: normalized, links });
  }

  return blocks;
}

function sectionKind(heading: string): ListingKind | null | "keep" {
  const normalized = heading
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (DAY_HEADING.test(normalized)) return "keep";
  const upper = normalized.toUpperCase();
  if (upper.includes("HAPPENIN")) return "event";
  if (/\b(CIVIL|CIVIC) NEWS\b|\bPUBLIC MEETINGS?\b|\bGOVERNMENT MEETINGS?\b/.test(upper)) return "meeting";
  return null;
}

function labeledLine(text: string, label: string): string | undefined {
  const match = text.match(new RegExp(`(?:^|\\n)\\s*${label}:\\s*([^\\n]+)`, "i"));
  return match ? cleanLine(match[1]) : undefined;
}

interface ParsedDates {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Picks the year so a "January 3" listing in a late-December issue lands in the next year. */
function resolveYear(month: number, day: number, reference: Date): number {
  const year = reference.getUTCFullYear();
  const candidate = Date.UTC(year, month - 1, day);
  const sixtyDays = 60 * 24 * 60 * 60 * 1000;
  return candidate < reference.getTime() - sixtyDays ? year + 1 : year;
}

interface TimeToken {
  hour: number;
  minute: number;
  meridiem?: "am" | "pm";
  index: number;
  end: number;
}

function toTwentyFour(token: TimeToken, meridiem: "am" | "pm"): string {
  let hour = token.hour % 12;
  if (meridiem === "pm") hour += 12;
  return `${pad(hour)}:${pad(token.minute)}`;
}

function parseTimes(text: string): { startTime?: string; endTime?: string } {
  const pattern = /\b(noon|midnight)\b|\b(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?(?![\d:])/gi;
  const tokens: TimeToken[] = [];

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    const end = index + match[0].length;

    if (match[1]) {
      const isNoon = match[1].toLowerCase() === "noon";
      tokens.push({ hour: 12, minute: 0, meridiem: isNoon ? "pm" : "am", index, end });
      continue;
    }

    const hour = Number(match[2]);
    const minute = match[3] ? Number(match[3]) : 0;
    const meridiem = match[4] ? (match[4].toLowerCase().startsWith("a") ? "am" : "pm") : undefined;

    // A bare number with no minutes and no AM/PM is not a time.
    if (!match[3] && !meridiem) continue;
    if (hour < 1 || hour > 12 || minute > 59) continue;

    tokens.push({ hour, minute, meridiem, index, end });
  }

  if (tokens.length === 0) return {};

  const [first, second] = tokens;
  const isRange =
    second !== undefined &&
    /^\s*(?:–|—|-|to|until)\s*$/i.test(text.slice(first.end, second.index));

  if (isRange && second.meridiem) {
    let startMeridiem = first.meridiem ?? second.meridiem;
    // "11 – 1 PM" means 11 AM to 1 PM.
    if (!first.meridiem && second.meridiem === "pm" && first.hour !== 12 && first.hour > second.hour) {
      startMeridiem = "am";
    }
    return {
      startTime: toTwentyFour(first, startMeridiem),
      endTime: toTwentyFour(second, second.meridiem),
    };
  }

  if (!first.meridiem) return {};
  return { startTime: toTwentyFour(first, first.meridiem) };
}

/** Reads dates and times from a "When:" line. Returns null when no date is present. */
export function parseWhen(whenText: string, reference: Date): ParsedDates | null {
  const datePattern =
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*(?:–|—|-|to|through|thru)\s*(\d{1,2})(?:st|nd|rd|th)?)?(?![\d:])/gi;

  const dates: string[] = [];
  let lastDateEnd = 0;

  for (const match of whenText.matchAll(datePattern)) {
    const month = MONTHS[match[1].slice(0, 3).toLowerCase()];
    const day = Number(match[2]);
    if (!month || day < 1 || day > 31) continue;

    const year = resolveYear(month, day, reference);
    dates.push(toIso(year, month, day));

    if (match[3]) {
      const rangeEnd = Number(match[3]);
      if (rangeEnd > day && rangeEnd <= 31) dates.push(toIso(year, month, rangeEnd));
    }

    lastDateEnd = (match.index ?? 0) + match[0].length;
  }

  if (dates.length === 0) return null;

  const sorted = [...dates].sort();
  const times = parseTimes(whenText.slice(lastDateEnd));

  return {
    startDate: dates[0],
    endDate: sorted[sorted.length - 1] >= dates[0] ? sorted[sorted.length - 1] : dates[0],
    ...times,
  };
}

/** Extracts every event and meeting listing from one issue's HTML. */
export function extractListings(html: string, publishDate: Date): Listing[] {
  const blocks = htmlToBlocks(html);
  const listings: Listing[] = [];
  let section: ListingKind | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === "heading") {
      const kind = sectionKind(block.text);
      if (kind !== "keep") section = kind;
      continue;
    }

    if (!section) continue;

    const whenMatch = block.text.match(/(?:^|\n)\s*When:/i);
    if (!whenMatch) continue;

    // Title is the text before "When:" in this block, or the previous block.
    const beforeWhen = block.text.slice(0, whenMatch.index).trim();
    let title = beforeWhen.split("\n").filter(Boolean).pop() ?? "";
    let links = block.links;

    if (!title) {
      const previous = blocks[i - 1];
      if (previous?.type === "block" && !/(?:^|\n)\s*When:/i.test(previous.text)) {
        title = previous.text.split("\n").filter(Boolean).pop() ?? "";
        links = previous.links;
      }
    }

    if (!title) continue;

    // Some editors split When/What/Where into separate paragraphs.
    let combined = block.text;
    for (let j = i + 1; j < Math.min(i + 3, blocks.length); j++) {
      const next = blocks[j];
      if (next.type !== "block" || !/^\s*(What|Where):/i.test(next.text)) break;
      combined += `\n${next.text}`;
    }

    const whenText = labeledLine(combined, "When");
    if (!whenText) continue;

    const dates = parseWhen(whenText, publishDate);
    if (!dates) continue;

    const link = links.find((l) => l.text === title) ?? links[0];

    listings.push({
      kind: section,
      title,
      url: link?.url,
      whenText,
      whatText: labeledLine(combined, "What"),
      whereText: labeledLine(combined, "Where")?.replace(/\.$/, ""),
      ...dates,
    });
  }

  return listings;
}

/** Today's date (YYYY-MM-DD) in the given time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Merges listings from several issues (newest issue first), drops anything
 * that has already ended, removes duplicates, and sorts by date and time.
 */
export function upcomingListings(
  issues: { html: string | undefined; publishDate: Date }[],
  today: string
): Listing[] {
  const seen = new Set<string>();
  const result: Listing[] = [];

  for (const issue of issues) {
    if (!issue.html) continue;
    for (const listing of extractListings(issue.html, issue.publishDate)) {
      if (listing.endDate < today) continue;
      const key = `${listing.kind}|${normalizeTitle(listing.title)}|${listing.startDate}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(listing);
    }
  }

  return result.sort((a, b) => {
    const dayA = a.startDate < today ? today : a.startDate;
    const dayB = b.startDate < today ? today : b.startDate;
    if (dayA !== dayB) return dayA < dayB ? -1 : 1;
    return (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99");
  });
}

/** The day a listing should appear under: its start date, or today if it's already running. */
export function displayDay(listing: Listing, today: string): string {
  return listing.startDate < today ? today : listing.startDate;
}

/** UTC offset like "-04:00" for a date in the given time zone. */
export function utcOffset(date: string, timeZone: string): string {
  const reference = new Date(`${date}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(reference)
    .find((part) => part.type === "timeZoneName")?.value;

  const match = name?.match(/GMT([+-]\d{2}):?(\d{2})?/);
  if (!match) return "Z";
  return `${match[1]}:${match[2] ?? "00"}`;
}

function splitPlace(whereText: string): { name: string; address: string } {
  const parts = whereText.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1 && !/\d/.test(parts[0])) {
    return { name: parts[0], address: parts.slice(1).join(", ") };
  }
  return { name: whereText, address: whereText };
}

/** schema.org Event data so search engines can show listings as events. */
export function listingToEventSchema(listing: Listing, timeZone: string) {
  const startOffset = utcOffset(listing.startDate, timeZone);
  const endOffset = utcOffset(listing.endDate, timeZone);

  const startDate = listing.startTime
    ? `${listing.startDate}T${listing.startTime}:00${startOffset}`
    : listing.startDate;

  let endDate: string | undefined;
  if (listing.endTime) {
    endDate = `${listing.endDate}T${listing.endTime}:00${endOffset}`;
  } else if (listing.endDate !== listing.startDate) {
    endDate = listing.endDate;
  }

  const place = listing.whereText ? splitPlace(listing.whereText) : undefined;

  return {
    "@type": "Event",
    name: listing.title,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(listing.whatText ? { description: listing.whatText } : {}),
    ...(listing.url ? { url: listing.url } : {}),
    ...(place
      ? {
          location: {
            "@type": "Place",
            name: place.name,
            address: place.address,
          },
        }
      : {}),
  };
}
