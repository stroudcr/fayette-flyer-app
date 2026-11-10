import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBusinessForm, parseJoinForm, parseListingForm, hasPublicCategory, listingRequirements, toBusiness, type ListingRow } from "./content";
import { freeBusiness, mergeFreeBusinesses, parseFreeForm, type FreeSubmission } from "./free-content";
import { CATEGORIES, CATEGORY_GROUPS } from "@/lib/directory/categories";
import { directionsUrl, fullAddress, mapEmbedUrl, streetLine, upgradeDetailsFrom, upgradeHref } from "@/lib/directory";
import { locationLabel } from "@/lib/directory/location";
import { generateLocalBusinessSchema } from "@/lib/directory/schemas";
import type { Business } from "@/lib/directory/types";

const base = { name: "Example Business", category: "handmade-goods-crafts", businessType: "storefront", city: "Peachtree City", street: "10 Private Lane", suite: "Unit 2", zip: "30269", email: "owner@example.com", website: "example.com", plan: "yearly", contactName: "Example Owner", contactRole: "Owner", authorized: "yes" };
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...base, ...overrides })) data.set(key, value);
  return data;
}

test("crafts has a browsable category, while Other is only a submission fallback", () => {
  assert.ok(CATEGORY_GROUPS.some((g) => g.slug === "shopping-gifts"));
  assert.equal(CATEGORIES.find((c) => c.slug === "handmade-goods-crafts")?.group, "shopping-gifts");
  assert.equal(hasPublicCategory("other"), false);
  assert.ok(parseFreeForm(form({ category: "other", categorySuggestion: "" })).errors.categorySuggestion);
  const result = parseFreeForm(form({ category: "other", categorySuggestion: "Custom handmade gifts" }));
  assert.deepEqual(result.errors, {});
  assert.equal(result.content.categorySuggestion, "Custom handmade gifts");
  const row = { slug: "example", category: "other", content: result.content, created_at: "2026-11-10", status: "live" } as FreeSubmission;
  assert.deepEqual(mergeFreeBusinesses([], [row]), []);
  assert.equal("categorySuggestion" in freeBusiness(row), false);
});

test("all three form parsers enforce conditional address and online shop requirements", () => {
  const existing = parseBusinessForm(form()).content;
  for (const businessType of ["service-area", "online-only"]) {
    for (const parsed of [parseFreeForm(form({ businessType, street: "", zip: "" })), parseJoinForm(form({ businessType, street: "", zip: "" })), parseListingForm(form({ businessType, street: "", zip: "" }), existing)]) {
      assert.deepEqual(parsed.errors, {});
      assert.equal(parsed.content.town, "Peachtree City");
      assert.equal(parsed.content.address.street, "");
      assert.equal(parsed.content.address.zip, "");
      assert.equal(parsed.content.businessType, businessType);
    }
    // Old or forged hidden address inputs must not be retained when saving.
    const parsed = parseBusinessForm(form({ businessType }));
    assert.equal(parsed.content.address.street, "");
    assert.equal(parsed.content.address.suite, undefined);
    assert.equal(parsed.content.address.zip, "");
  }
  for (const parse of [parseFreeForm, parseJoinForm, (f: FormData) => parseListingForm(f, existing)]) {
    assert.ok(parse(form({ businessType: "online-only", website: "" })).errors.website);
    assert.ok(parse(form({ businessType: "storefront", street: "", zip: "" })).errors.street);
    assert.ok(parse(form({ businessType: "storefront", street: "", zip: "" })).errors.zip);
    assert.ok(parse(form({ businessType: "unknown" })).errors.businessType);
    assert.ok(parse(form({ businessType: "service-area", city: "" })).errors.city);
    assert.deepEqual(parse(form({ businessType: "service-area", website: "" })).errors, {});
  }
  assert.equal(listingRequirements({ ...existing, businessType: "online-only", website: undefined }).website, "Enter your website or online shop link.");
});

test("non-storefront addresses never enter public data, maps, structured data or upgrade URLs", () => {
  const content = parseBusinessForm(form()).content;
  for (const businessType of ["service-area", "online-only"] as const) {
    const privateContent = { ...content, businessType, categorySuggestion: "Private staff note" };
    const row = { slug: "example", category: base.category, content: privateContent, created_at: "2026-11-10", updated_at: "2026-11-10", approved_at: null } as ListingRow;
    for (const business of [toBusiness(row), freeBusiness({ ...row, reviewed_at: null } as unknown as FreeSubmission)]) {
      const json = JSON.stringify(business);
      for (const value of ["10 Private Lane", "Unit 2", "30269", "Private staff note"]) assert.equal(json.includes(value), false);
    }
    // Also protect renderers when handed an unsanitized old database row.
    const business: Business = { ...privateContent, slug: "example", category: base.category, tier: "free", addedAt: "2026-11-10" };
    assert.equal(streetLine(business), "");
    assert.equal(directionsUrl(business), "");
    assert.equal(mapEmbedUrl(business), "");
    assert.equal(fullAddress(business), locationLabel(business));
    const schema = generateLocalBusinessSchema(business, CATEGORIES.find((c) => c.slug === base.category)!);
    assert.equal("streetAddress" in schema.address, false);
    assert.equal("postalCode" in schema.address, false);
    assert.equal("areaServed" in schema, false);
    assert.equal(schema.address.addressLocality, "Peachtree City");
    if (businessType === "online-only") assert.equal(schema["@type"], "OnlineStore");
    const url = new URL(upgradeHref({ ...base, businessType }), "https://www.fayetteflyer.com");
    for (const key of ["street", "suite", "zip"]) assert.equal(url.searchParams.has(key), false);
    assert.equal(upgradeDetailsFrom(Object.fromEntries(url.searchParams)).businessType, businessType);
  }
});

test("older listings keep their address display and remain eligible for review", () => {
  const business = { ...parseBusinessForm(form()).content, businessType: undefined, slug: "example", category: base.category, tier: "free", addedAt: "2026-11-10" } as Business;
  assert.equal(locationLabel(business), "Peachtree City");
  assert.equal(streetLine(business), "10 Private Lane, Unit 2");
  assert.match(directionsUrl(business), /google\.com\/maps/);
  assert.deepEqual(listingRequirements(business), {});
});
