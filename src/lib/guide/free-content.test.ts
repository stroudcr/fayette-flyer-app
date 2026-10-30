import { test } from "node:test";
import assert from "node:assert/strict";
import { freeBusiness, mergeFreeBusinesses, parseFreeForm, type FreeSubmission } from "./free-content";
import type { Business } from "@/lib/directory/types";

const entries = {
  name: "Test Plumbing", category: "plumbers", town: "Tyrone", street: "10 Main Street", zip: "30290",
  email: "Owner@Example.com ", contactName: "Test Owner", contactRole: "Owner", authorized: "yes",
  phone: "7705551234", website: "example.com", "hours.mon.mode": "open", "hours.mon.opens": "08:00", "hours.mon.closes": "17:00",
};
const form = (overrides: Record<string, string> = {}) => {
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...entries, ...overrides })) data.set(key, value);
  return data;
};

test("free submissions validate contact, consent and business data without requiring payment", () => {
  const result = parseFreeForm(form());
  assert.deepEqual(result.errors, {});
  assert.equal(result.email, "owner@example.com");
  assert.equal(result.content.phone, "(770) 555-1234");
  assert.equal(result.content.website, "https://example.com");
  assert.deepEqual(result.content.hours, { mon: [{ opens: "08:00", closes: "17:00" }] });
  const invalid = parseFreeForm(form({ authorized: "", contactName: "", contactRole: "", email: "bad", town: "Atlanta", category: "bad", phone: "123", "hours.mon.opens": "bad" }));
  for (const key of ["authorized", "contactName", "contactRole", "email", "town", "category", "phone", "hours.mon"]) assert.ok(invalid.errors[key], key);
});

const submission = (status: FreeSubmission["status"]): FreeSubmission => ({
  id: "example", slug: "test-plumbing", claimed_slug: "test-plumbing", category: "plumbers", status,
  owner_email: "private@example.com", contact_name: "Private Person", contact_role: "Owner",
  content: parseFreeForm(form()).content, admin_note: null, created_at: "2026-10-30T12:00:00Z", reviewed_at: "2026-10-30T13:00:00Z",
});
const original: Business = {
  ...parseFreeForm(form()).content, slug: "test-plumbing", category: "plumbers", tier: "free",
  name: "Old Name", description: ["Existing editorial description"], addedAt: "2026-10-01",
};

test("pending, rejected and hidden submissions cannot change the public directory", () => {
  for (const status of ["pending", "rejected", "hidden", "superseded"] as const) {
    assert.deepEqual(mergeFreeBusinesses([original], [submission(status)]), [original]);
    assert.deepEqual(mergeFreeBusinesses([], [submission(status)]), []);
  }
});

test("approved claims replace a single entry while preserving its URL and editorial content", () => {
  const businesses = mergeFreeBusinesses([original], [submission("pending"), submission("live")]);
  assert.equal(businesses.length, 1);
  assert.equal(businesses[0].slug, original.slug);
  assert.equal(businesses[0].tier, "free");
  assert.equal(businesses[0].name, "Test Plumbing");
  assert.deepEqual(businesses[0].description, original.description);
  assert.equal(businesses[0].addedAt, original.addedAt);
  const publicData = JSON.stringify(freeBusiness(submission("live")));
  for (const privateValue of ["private@example.com", "Private Person", "contact_role", "owner_email", "admin_note"]) assert.equal(publicData.includes(privateValue), false);
});

test("approved new submissions appear as free and cannot displace a featured member", () => {
  assert.equal(mergeFreeBusinesses([], [submission("live")])[0].tier, "free");
  const featured = { ...original, tier: "featured" as const };
  assert.deepEqual(mergeFreeBusinesses([featured], [submission("live")]), [featured]);
});
