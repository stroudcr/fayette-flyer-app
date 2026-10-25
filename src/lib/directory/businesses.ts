import type { Business } from "./types";

/**
 * Every business in the Local Business Guide.
 *
 * To add a business, add an object to this array;
 * the full shape is `Business` in ./types.ts. A minimal free listing:
 *
 *   {
 *     slug: "business-name",
 *     name: "Business Name",
 *     category: "plumbers",              // a slug from ./categories.ts
 *     tier: "free",                      // or "featured" for paying members
 *     town: "Peachtree City",
 *     address: { street: "123 Street Name", city: "Peachtree City", state: "GA", zip: "30269" },
 *     phone: "(770) 000-0000",
 *     website: "https://example.com",
 *     addedAt: "2026-11-01",
 *   },
 *
 * Featured members can also have tagline, description, services, hours,
 * tags, perk, photos and flyerMentions.
 *
 * `npm run test:directory` checks the entries (unique slugs, real categories,
 * valid dates and hours) before you deploy.
 */
export const BUSINESSES: Business[] = [
  {
    // Sources: https://www.peachtreecitychiropractor.com/, /about/ and /contact-us/.
    slug: "healthchoice-chiropractic",
    name: "HealthChoice Chiropractic",
    category: "chiropractors",
    tier: "free",
    town: "Peachtree City",
    address: {
      street: "14 Eastbrook Bend",
      suite: "Suite 201",
      city: "Peachtree City",
      state: "GA",
      zip: "30269",
    },
    phone: "(770) 408-0184",
    website: "https://www.peachtreecitychiropractor.com/",
    tagline: "Chiropractic and injury rehabilitation off Highway 54, with Saturday appointments.",
    description: [
      "HealthChoice Chiropractic has served the Peachtree City area since 2009 from its office on Eastbrook Bend. Its services include chiropractic adjustments, nonsurgical spinal decompression and cold laser therapy, along with rehabilitation for sports injuries and auto accidents.",
      "New patients can book through the practice's online scheduler or call the office. The published schedule includes Saturday mornings and Wednesday evening appointments, with a midday break on weekdays.",
    ],
    services: [
      "Chiropractic adjustments",
      "Nonsurgical spinal decompression",
      "Sports injury rehabilitation",
      "Auto injury rehabilitation",
      "Cold laser therapy",
    ],
    hours: {
      mon: [{ opens: "08:00", closes: "12:00" }, { opens: "14:00", closes: "18:00" }],
      tue: [{ opens: "08:00", closes: "12:00" }, { opens: "14:00", closes: "18:00" }],
      wed: [{ opens: "08:00", closes: "12:00" }, { opens: "14:00", closes: "20:00" }],
      thu: [{ opens: "08:00", closes: "12:00" }, { opens: "14:00", closes: "18:00" }],
      fri: [{ opens: "08:00", closes: "12:00" }, { opens: "14:00", closes: "18:00" }],
      sat: [{ opens: "09:00", closes: "12:00" }],
      sun: [],
    },
    addedAt: "2026-10-25",
    verifiedAt: "2026-10-25",
  },
  {
    // Sources: https://www.healthquestdocs.com/contact, /meet-the-doctors and /services.
    slug: "healthquest-chiropractic-of-georgia",
    name: "HealthQuest Chiropractic of Georgia",
    category: "chiropractors",
    tier: "free",
    town: "Fayetteville",
    address: {
      street: "745 Glynn Street South",
      city: "Fayetteville",
      state: "GA",
      zip: "30214",
    },
    phone: "(770) 599-1010",
    website: "https://www.healthquestdocs.com/",
    tagline: "Chiropractic appointments, spinal decompression and rehabilitation on Glynn Street South.",
    description: [
      "David and Adrienne Winfrey see patients at HealthQuest Chiropractic of Georgia in Fayetteville. The practice pairs instrument-assisted chiropractic adjustments with spinal decompression, exercise rehabilitation and soft tissue therapies. Its website lists care for back and neck concerns, disc injuries and recovery after auto accidents.",
      "Patients can request an appointment online or call the Glynn Street South office. The practice publishes weekday hours, with a shorter schedule on Fridays, and offers guidance on workplace ergonomics as part of its services.",
    ],
    services: [
      "Instrument-assisted chiropractic adjustments",
      "Nonsurgical spinal decompression",
      "Rehabilitation exercises",
      "Soft tissue therapy",
      "Workplace ergonomics guidance",
    ],
    hours: {
      mon: [{ opens: "10:00", closes: "18:00" }],
      tue: [{ opens: "10:00", closes: "18:00" }],
      wed: [{ opens: "10:00", closes: "18:00" }],
      thu: [{ opens: "10:00", closes: "18:00" }],
      fri: [{ opens: "10:00", closes: "13:30" }],
      sat: [],
      sun: [],
    },
    addedAt: "2026-10-25",
    verifiedAt: "2026-10-25",
  },
];
