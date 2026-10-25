import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublic, parseJoinForm, parseListingForm, slugify, toBusiness, type ListingContent, type ListingRow } from "./content";

function form(entries: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const base: ListingContent = {
  name: "Example Business",
  town: "Tyrone",
  address: { street: "1 Main St", city: "Tyrone", state: "GA", zip: "30290" },
};

test("slugify makes clean, readable slugs", () => {
  assert.equal(slugify("Joe's Plumbing & Heating"), "joes-plumbing-and-heating");
  assert.equal(slugify("  Café   Olé!  "), "cafe-ole");
  assert.equal(slugify("***"), "");
  assert.ok(slugify("a".repeat(100)).length <= 60);
});

test("join form validates and normalizes", () => {
  const ok = parseJoinForm(
    form({
      name: "Example Business",
      category: "plumbers",
      town: "Tyrone",
      street: "1 Main St",
      zip: "30290",
      email: "Owner@Example.com ",
      plan: "yearly",
      phone: "770.555.1234",
      website: "example.com",
    })
  );
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.email, "owner@example.com");
  assert.equal(ok.content.phone, "(770) 555-1234");
  assert.equal(ok.content.website, "https://example.com");
  assert.equal(ok.content.address.city, "Tyrone");

  const bad = parseJoinForm(form({ name: "", category: "nope", town: "Atlanta", street: "", zip: "123", email: "x", plan: "weekly", phone: "123" }));
  for (const key of ["name", "category", "town", "street", "zip", "email", "plan", "phone"]) {
    assert.ok(bad.errors[key], `expected an error for ${key}`);
  }
});

test("listing form parses hours, services, tags, perk and paragraphs", () => {
  const { errors, content } = parseListingForm(
    form({
      name: "Example Business",
      town: "Tyrone",
      street: "1 Main St",
      zip: "30290",
      description: "First paragraph.\n\nSecond   paragraph\nwraps.",
      services: "Repairs\n\nInstalls\n",
      tags: ["open-saturday", "bogus", "open-saturday"],
      "perk.title": "Free estimate",
      "perk.code": "flyer",
      "hours.mon.mode": "open",
      "hours.mon.opens": "08:00",
      "hours.mon.closes": "17:00",
      "hours.sun.mode": "closed",
      "hours.tue.mode": "",
    }),
    base
  );
  assert.deepEqual(errors, {});
  assert.deepEqual(content.description, ["First paragraph.", "Second paragraph wraps."]);
  assert.deepEqual(content.services, ["Repairs", "Installs"]);
  assert.deepEqual(content.tags, ["open-saturday"]);
  assert.deepEqual(content.perk, { title: "Free estimate", details: undefined, code: "FLYER" });
  assert.deepEqual(content.hours, { mon: [{ opens: "08:00", closes: "17:00" }], sun: [] });
});

test("listing form rejects bad hours and photos from other hosts", () => {
  const { errors, content } = parseListingForm(
    form({
      name: "Example Business",
      town: "Tyrone",
      street: "1 Main St",
      zip: "30290",
      "hours.wed.mode": "open",
      "hours.wed.opens": "8am",
      photos: JSON.stringify([
        { src: "https://evil.example.com/x.jpg", alt: "x" },
        { src: "https://abc123.public.blob.vercel-storage.com/guide/a.jpg", alt: "Front door" },
      ]),
    }),
    base
  );
  assert.ok(errors["hours.wed"]);
  assert.deepEqual(content.photos, [{ src: "https://abc123.public.blob.vercel-storage.com/guide/a.jpg", alt: "Front door" }]);
});

test("only approved, paying listings are public", () => {
  assert.equal(isPublic({ status: "live", subscription_status: "active" }), true);
  assert.equal(isPublic({ status: "live", subscription_status: "past_due" }), true);
  assert.equal(isPublic({ status: "live", subscription_status: "unpaid" }), false);
  assert.equal(isPublic({ status: "pending", subscription_status: "active" }), false);
  assert.equal(isPublic({ status: "hidden", subscription_status: "active" }), false);
});

test("database rows become featured directory businesses", () => {
  const row = {
    id: "00000000-0000-0000-0000-000000000000",
    slug: "example-business",
    category: "plumbers",
    status: "live",
    owner_email: "owner@example.com",
    plan: "monthly",
    content: base,
    created_at: "2026-10-01T12:00:00.000Z",
    updated_at: "2026-10-20T12:00:00.000Z",
    approved_at: "2026-10-02T12:00:00.000Z",
  } as ListingRow;
  const business = toBusiness(row);
  assert.equal(business.tier, "featured");
  assert.equal(business.addedAt, "2026-10-02");
  assert.equal(business.verifiedAt, "2026-10-20");
});
