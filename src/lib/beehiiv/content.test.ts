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

test("preserves web typography, dashed dividers, and authored line breaks through sanitization", () => {
  // Representative markup returned by free_web_content. border-top used to be
  // stripped by the page's second sanitizer, leaving only an empty spacer.
  const $ = loadCleaned(`
    <div class="rendered-post" style="max-width:672px;margin:0 auto">
      <div id="web-header"><h1>Duplicate title</h1></div>
      <div id="content-blocks">
        <div style="padding:12px 10px">
          <p style="font-family:'Helvetica',Arial,sans-serif;font-size:18px;line-height:1.5;white-space:pre-wrap">First line<br><br>New paragraph</p>
          <p></p>
        </div>
        <div style="font-size:0px;line-height:0px;padding:30px 0px">
          <div style="margin:0 auto;border-top:5px dashed #EEEEEE;width:97%"></div>
        </div>
        <a href="https://example.com" style="text-decoration:underline #2979BF;color:#2979BF">Read more</a>
      </div>
    </div>
  `);

  assert.equal($("#web-header").length, 0);
  assert.match($(".rendered-post").attr("style") || "", /max-width:672px/);
  assert.match($("p").first().attr("style") || "", /font-family:'Helvetica',Arial,sans-serif/);
  assert.match($("p").first().attr("style") || "", /white-space:pre-wrap/);
  assert.equal($("p").first().html(), "First line<br><br>New paragraph");
  assert.equal($("p:empty").length, 1);
  assert.equal($('[style*="border-top:5px dashed #EEEEEE"]').length, 1);
  assert.match($("a").attr("style") || "", /text-decoration:underline #2979BF/);
});

test("preserves modern sponsor columns and their spacing", () => {
  const $ = loadCleaned(`
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
      <p>In partnership with</p>
      <a href="https://example.com"><img src="https://media.beehiiv.com/uploads/ad_network/advertiser/logo/logo.png"></a>
    </div>
  `);
  assert.equal($("body > div").attr("style"), "display:flex;flex-direction:column;align-items:center;gap:12px");
});

test("keeps newsletter markup safe while allowing visual styles", () => {
  const $ = loadCleaned(`
    <style>body { display:none }</style><script>alert(1)</script>
    <p onclick="alert(1)" style="position:fixed;z-index:9999;color:red;--wt-color:blue">Safe text</p>
    <a href="javascript:alert(1)">Unsafe link</a>
    <img src="https://example.com/photo.png" onerror="alert(1)" style="background-color:url(https://example.com/tracker)">
    <iframe src="https://example.com/embed"></iframe>
    <iframe src="https://www.youtube.com/embed/test" title="Video"></iframe>
  `);
  assert.equal($("script, style").length, 0);
  assert.equal($("[onclick], [onerror]").length, 0);
  assert.equal($("p").attr("style"), "color:red");
  assert.equal($("a").attr("href"), undefined);
  assert.equal($("img").attr("style"), undefined);
  assert.equal($("iframe").first().attr("src"), undefined);
  assert.equal($("iframe").last().attr("src"), "https://www.youtube.com/embed/test");
});
