import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSiteUrl } from "./site-url";

test("uses the production URL when the value is missing or empty", () => {
  assert.equal(normalizeSiteUrl(), "https://www.fayetteflyer.com");
  assert.equal(normalizeSiteUrl(" \n\t"), "https://www.fayetteflyer.com");
});

test("removes surrounding whitespace and trailing slashes", () => {
  assert.equal(
    normalizeSiteUrl("  https://www.fayetteflyer.com///\n"),
    "https://www.fayetteflyer.com",
  );
});

test("preserves a valid deployment URL and path", () => {
  assert.equal(
    normalizeSiteUrl("https://preview.example.com/fayette"),
    "https://preview.example.com/fayette",
  );
});
