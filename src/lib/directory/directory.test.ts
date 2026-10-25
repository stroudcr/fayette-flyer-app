import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESSES } from "./businesses";
import { CATEGORIES, CATEGORY_GROUPS } from "./categories";
import { TAGS } from "./tags";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { DAY_ORDER, formatTime, guideEdition, sortBusinesses, telHref } from "./index";
import type { Business } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

test("category and group slugs are unique and well formed", () => {
  const groupSlugs = CATEGORY_GROUPS.map((g) => g.slug);
  assert.equal(new Set(groupSlugs).size, groupSlugs.length, "duplicate group slug");

  const slugs = CATEGORIES.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate category slug");

  for (const category of CATEGORIES) {
    assert.match(category.slug, SLUG, `bad category slug: ${category.slug}`);
    assert.ok(groupSlugs.includes(category.group), `${category.slug} has unknown group ${category.group}`);
  }
});

test("every group has at least one category", () => {
  for (const group of CATEGORY_GROUPS) {
    assert.ok(CATEGORIES.some((c) => c.group === group.slug), `${group.slug} is empty`);
  }
});

test("business entries are valid", () => {
  const categorySlugs = new Set(CATEGORIES.map((c) => c.slug));
  const seen = new Set<string>();

  for (const b of BUSINESSES) {
    const label = b.name || b.slug;
    assert.match(b.slug, SLUG, `${label}: bad slug`);
    assert.ok(!seen.has(b.slug), `${label}: duplicate slug ${b.slug}`);
    seen.add(b.slug);

    assert.ok(categorySlugs.has(b.category), `${label}: unknown category ${b.category}`);
    assert.ok(SITE_CONFIG.cities.includes(b.town), `${label}: unknown town ${b.town}`);
    assert.match(b.addedAt, DATE, `${label}: addedAt must be YYYY-MM-DD`);
    if (b.verifiedAt) assert.match(b.verifiedAt, DATE, `${label}: verifiedAt must be YYYY-MM-DD`);
    if (b.website) assert.match(b.website, /^https?:\/\//, `${label}: website needs https://`);
    if (b.phone) assert.equal(b.phone.replace(/\D/g, "").replace(/^1/, "").length, 10, `${label}: phone needs 10 digits`);

    for (const tag of b.tags ?? []) assert.ok(tag in TAGS, `${label}: unknown tag ${tag}`);
    for (const photo of b.photos ?? []) {
      assert.ok(photo.src.startsWith("/"), `${label}: photo src should be a path under /public`);
      assert.ok(photo.alt.trim(), `${label}: photo needs alt text`);
    }
    for (const mention of b.flyerMentions ?? []) assert.match(mention.date, DATE, `${label}: mention date`);

    for (const [day, intervals] of Object.entries(b.hours ?? {})) {
      assert.ok(DAY_ORDER.includes(day as never), `${label}: unknown day ${day}`);
      for (const i of intervals ?? []) {
        assert.match(i.opens, TIME, `${label}: ${day} opens must be HH:MM`);
        assert.match(i.closes, TIME, `${label}: ${day} closes must be HH:MM`);
      }
    }
  }
});

test("featured members sort first, then A to Z", () => {
  const base = { category: "plumbers", town: "Tyrone", addedAt: "2026-01-01", address: { street: "1 A St", city: "Tyrone", state: "GA", zip: "30290" } } as const;
  const list: Business[] = [
    { ...base, slug: "b", name: "Bravo", tier: "free" },
    { ...base, slug: "c", name: "Charlie", tier: "featured" },
    { ...base, slug: "a", name: "alpha", tier: "free" },
  ];
  assert.deepEqual(sortBusinesses(list).map((b) => b.slug), ["c", "a", "b"]);
});

test("formatting helpers", () => {
  assert.equal(formatTime("08:00"), "8:00a");
  assert.equal(formatTime("13:30"), "1:30p");
  assert.equal(formatTime("00:00"), "12:00a");
  assert.equal(formatTime("12:00"), "12:00p");
  assert.equal(telHref("(770) 555-0142"), "tel:+17705550142");
  assert.equal(telHref("1-770-555-0142"), "tel:+17705550142");
  assert.equal(guideEdition(new Date("2026-10-24T12:00:00Z")), "Fall 2026");
  assert.equal(guideEdition(new Date("2027-01-10T12:00:00Z")), "Winter 2027");
});
