import assert from "node:assert/strict";
import test from "node:test";
import * as cheerio from "cheerio";
import { cleanBeehiivContent } from "./content.ts";

function loadCleaned(html: string) {
  return cheerio.load(cleanBeehiivContent(html), { xml: false });
}

test("stacks Beehiiv top advertiser logo blocks below the sponsor label", () => {
  const href = "https://example.com/?_bhiiv=opp_123&bhcl_id=abc";
  const src = "https://media.beehiiv.com/cdn-cgi/image/uploads/ad_network/advertiser/logo/logo.png";

  const $ = loadCleaned(`
    <div id="content-blocks">
      <div style="display:flex;margin:0 auto 0 auto;padding-bottom:12px">
        <p style="display:block;margin:0 auto 0 auto;text-align:center;width:300px"><b> Sponsored by </b></p>
        <a href="${href}" rel="nofollow noopener noreferrer" style="margin:0 auto 0 auto;width:300px" target="_blank">
          <img style="width:300px" src="${src}" />
        </a>
      </div>
    </div>
  `);

  const wrapper = $("#content-blocks > div").first();
  const link = wrapper.find("a").first();

  assert.match(wrapper.attr("style") || "", /display:block/);
  assert.doesNotMatch(wrapper.attr("style") || "", /display:flex/);
  assert.match(link.attr("style") || "", /display:block/);
  assert.equal(link.attr("href"), href);
  assert.equal(link.find("img").attr("src"), src);
  assert.match(wrapper.find("p").text(), /Sponsored by/);
});

test("does not require sponsor label text to start with Sponsored by", () => {
  const $ = loadCleaned(`
    <div style="display:flex;margin:0 auto 0 auto">
      <p style="display:block;margin:0 auto 0 auto;text-align:center;width:300px"><b> Presented by our local partner </b></p>
      <a href="https://example.com" style="margin:0 auto 0 auto;width:300px">
        <img style="width:300px" src="https://media.beehiiv.com/cdn-cgi/image/uploads/ad_network/advertiser/logo/logo.png" />
      </a>
    </div>
  `);

  const wrapper = $("body > div").first();

  assert.match(wrapper.attr("style") || "", /display:block/);
  assert.match(wrapper.find("p").text(), /Presented by our local partner/);
});

test("leaves in-body advertiser creative images unchanged", () => {
  const html = `
    <div style="display:flex;margin:0 auto 0 auto">
      <a href="https://example.com/?_bhiiv=opp_123" style="margin:0 auto 0 auto;width:100%">
        <img style="margin:0 auto 0 auto;width:100%" src="https://media.beehiiv.com/cdn-cgi/image/uploads/asset/file/ad-creative.png" />
      </a>
    </div>
  `;

  const $ = loadCleaned(html);
  const wrapper = $("body > div").first();
  const link = wrapper.find("a").first();

  assert.match(wrapper.attr("style") || "", /display:flex/);
  assert.doesNotMatch(link.attr("style") || "", /display:block/);
});

test("leaves unrelated flex blocks unchanged", () => {
  const $ = loadCleaned(`
    <div style="display:flex;gap:12px">
      <span>One</span>
      <span>Two</span>
    </div>
  `);

  assert.equal($("body > div").attr("style"), "display:flex;gap:12px");
});
