import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanUrl,
  extractListings,
  listingToEventSchema,
  parseWhen,
  upcomingListings,
  utcOffset,
} from "./issue-listings";

const ISSUE_DATE = new Date("2026-10-12T10:00:00Z");

const ISSUE_HTML = `
<h3 class="heading"><b>THE DIGEST</b></h3>
<h4><b>Room to Grow at The Collection</b></h4>
<p class="paragraph">A story. When: this should not be picked up.</p>
<h3 class="heading"><b>CIVIL NEWS</b></h3>
<p class="paragraph"><span><a class="link" href="https://www.forsythco.com/meetings?view=upcoming&amp;utm_source=newsletter.forsythflyer.com&amp;utm_medium=referral" target="_blank">Board of Commissioners Work Session</a></span><br>When: Tuesday, October 13, 2:00 PM<br>What: Commissioners review upcoming agenda items.<br>Where: Forsyth County Administration Building, 110 E. Main Street, Cumming, GA 30040.</p>
<p class="paragraph"><a href="https://example.com/old">Last Week Council Meeting</a><br>When: Thursday, October 8, 9:30 AM<br>What: Already happened.<br>Where: City Hall, 100 Main Street, Cumming, GA 30040</p>
<h3 class="heading"><b>WHAT&#8217;S HAPPENIN&#8217;</b></h3>
<h4 class="heading"><b>MONDAY</b></h4>
<img src="https://example.com/banner.png">
<p class="paragraph"><a class="link" href="https://www.forsythpl.org/event/1?utm_source=newsletter.forsythflyer.com">Books &amp; Babies</a><br>When: Monday, October 12, 10:00 AM &ndash; 10:30 AM<br>What: A birth-to-18-month storytime.<br>Where: Hampton Park Library, 5345 Settingdown Road, Cumming, GA 30041.</p>
<p class="paragraph"><a href="https://www.forsythpl.org/event/2">Conversational English</a><br>When: Monday, October 12, 11:00 AM – noon<br>What: Practice group.<br>Where: Denmark Library, 530 Fowler Road, Alpharetta, GA 30004.</p>
<p class="paragraph"><a href="https://www.bigtickets.com/e/fair">Cumming Country Fair &amp; Festival</a><br>When: Monday through Thursday, October 12–15, 4:00 PM – 10:00 PM each day<br>What: Rides, games, and food.<br>Where: Cumming Fairgrounds, 235 Castleberry Road, Cumming, GA 30040.</p>
<h4 class="heading"><b>UPCOMING</b></h4>
<p class="paragraph"><a href="https://www.visithalcyon.com/events/witches-night-out/?utm_source=chatgpt.com">Witches Night Out at Halcyon</a><br>When: Thursday, October 15, 6:00 PM – 10:00 PM<br>What: Annual Halloween ladies' night.<br>Where: Village Green at Halcyon, 6365 Halcyon Way, Alpharetta, GA 30005.</p>
<h3 class="heading"><b>WEATHER</b></h3>
<h4><b>Monday</b></h4>
<p>85° 🌡️ 55° | 🌤️ | 0% | 💨 7 mph NW</p>
`;

test("extracts events and meetings from their sections only", () => {
  const listings = extractListings(ISSUE_HTML, ISSUE_DATE);
  const events = listings.filter((l) => l.kind === "event");
  const meetings = listings.filter((l) => l.kind === "meeting");

  assert.deepEqual(
    events.map((e) => e.title),
    ["Books & Babies", "Conversational English", "Cumming Country Fair & Festival", "Witches Night Out at Halcyon"]
  );
  assert.equal(meetings.length, 2);
  assert.equal(meetings[0].title, "Board of Commissioners Work Session");
});

test("reads When, What, Where and cleans the link", () => {
  const [books] = extractListings(ISSUE_HTML, ISSUE_DATE).filter((l) => l.kind === "event");
  assert.equal(books.url, "https://www.forsythpl.org/event/1");
  assert.equal(books.whenText, "Monday, October 12, 10:00 AM – 10:30 AM");
  assert.equal(books.whatText, "A birth-to-18-month storytime.");
  assert.equal(books.whereText, "Hampton Park Library, 5345 Settingdown Road, Cumming, GA 30041");
  assert.equal(books.startDate, "2026-10-12");
  assert.equal(books.startTime, "10:00");
  assert.equal(books.endTime, "10:30");
});

test("parses noon, date ranges, and missing AM/PM", () => {
  assert.deepEqual(parseWhen("Monday, October 12, 11:00 AM – noon", ISSUE_DATE), {
    startDate: "2026-10-12", endDate: "2026-10-12", startTime: "11:00", endTime: "12:00",
  });
  assert.deepEqual(parseWhen("Monday through Thursday, October 12–15, 4:00 PM – 10:00 PM each day", ISSUE_DATE), {
    startDate: "2026-10-12", endDate: "2026-10-15", startTime: "16:00", endTime: "22:00",
  });
  assert.deepEqual(parseWhen("Tuesday, May 5, 5:30 – 7:30 PM", new Date("2026-04-28T00:00:00Z")), {
    startDate: "2026-05-05", endDate: "2026-05-05", startTime: "17:30", endTime: "19:30",
  });
  assert.deepEqual(parseWhen("Tuesday, October 13, and Thursday, October 15, 9:00 AM – 2:00 PM", ISSUE_DATE), {
    startDate: "2026-10-13", endDate: "2026-10-15", startTime: "09:00", endTime: "14:00",
  });
  assert.deepEqual(parseWhen("Wednesday, October 14; check-in at 8:00 AM, shotgun start at 10:00 AM", ISSUE_DATE), {
    startDate: "2026-10-14", endDate: "2026-10-14", startTime: "08:00",
  });
  assert.deepEqual(parseWhen("Saturday, October 17, all day", ISSUE_DATE), {
    startDate: "2026-10-17", endDate: "2026-10-17",
  });
  assert.equal(parseWhen("Every weekend this fall", ISSUE_DATE), null);
});

test("rolls January listings in a December issue into the next year", () => {
  const result = parseWhen("Saturday, January 2, 10:00 AM", new Date("2026-12-28T00:00:00Z"));
  assert.equal(result?.startDate, "2027-01-02");
});

test("drops ended listings, removes duplicates, and keeps running multi-day events", () => {
  const older = ISSUE_HTML.replace("Books &amp; Babies", "Books &amp; Babies");
  const listings = upcomingListings(
    [
      { html: ISSUE_HTML, publishDate: ISSUE_DATE },
      { html: older, publishDate: new Date("2026-10-08T10:00:00Z") },
    ],
    "2026-10-13"
  );

  const titles = listings.map((l) => l.title);
  assert.ok(!titles.includes("Books & Babies"), "Monday-only event ended");
  assert.ok(!titles.includes("Last Week Council Meeting"));
  assert.ok(titles.includes("Cumming Country Fair & Festival"), "fair still running");
  assert.equal(titles.filter((t) => t === "Witches Night Out at Halcyon").length, 1);
});

test("builds schema.org Event data with Eastern offsets", () => {
  assert.equal(utcOffset("2026-10-12", "America/New_York"), "-04:00");
  assert.equal(utcOffset("2026-12-12", "America/New_York"), "-05:00");
  assert.equal(utcOffset("2026-12-12", "America/Chicago"), "-06:00");

  const [, , fair] = extractListings(ISSUE_HTML, ISSUE_DATE).filter((l) => l.kind === "event");
  const schema = listingToEventSchema(fair, "America/New_York");

  assert.equal(schema["@type"], "Event");
  assert.equal(schema.startDate, "2026-10-12T16:00:00-04:00");
  assert.equal(schema.endDate, "2026-10-15T22:00:00-04:00");
  assert.deepEqual(schema.location, {
    "@type": "Place",
    name: "Cumming Fairgrounds",
    address: "235 Castleberry Road, Cumming, GA 30040",
  });
});

test("strips tracking parameters but keeps real ones", () => {
  assert.equal(
    cleanUrl("https://example.com/e?id=4&utm_source=chatgpt.com&_bhiiv=x"),
    "https://example.com/e?id=4"
  );
});

test("handles title and When lines split into separate paragraphs", () => {
  const html = `
    <h3>WHAT'S HAPPENIN'</h3>
    <p><a href="https://example.com/market">Farmers Market</a></p>
    <p>When: Saturday, October 17, 8:00 AM – 12:00 PM</p>
    <p>What: Local produce.</p>
    <p>Where: Cumming City Center, 423 Canton Highway, Cumming, GA 30040</p>`;
  const [market] = extractListings(html, ISSUE_DATE);
  assert.equal(market.title, "Farmers Market");
  assert.equal(market.url, "https://example.com/market");
  assert.equal(market.whatText, "Local produce.");
  assert.equal(market.endTime, "12:00");
});

test("reads every listing when a day's events share one paragraph (real issue format)", () => {
  const html = `
    <div><h3><b>WHAT'S HAPPENIN'</b></h3></div>
    <div><h4 style="margin:0"><b>Monday</b></h4></div>
    <div style="padding:12px"><p style="font-size:18px"><a class="link" href="https://www.forsythpl.org/event/17109896?utm_source=newsletter.forsythflyer.com&amp;utm_medium=referral" target="_blank" rel="noopener noreferrer">Books &amp; Babies</a><br />When: Monday, October 12, 10:00 AM – 10:30 AM<br />What: Storytime for babies.<br />Where: Hampton Park Library, 5345 Settingdown Road, Cumming, GA 30041.<br /><br /><a class="link" href="https://www.forsythpl.org/event/16644797">Conversational English</a><br />When: Monday, October 12, 11:00 AM – noon<br />What: Practice group.<br />Where: Denmark Library, 530 Fowler Road, Alpharetta, GA 30004.<br /><br /><a class="link" href="https://www.bigtickets.com/e/fair">Cumming Country Fair &amp; Festival</a><br />When: Monday through Thursday, October 12–15, 4:00 PM – 10:00 PM each day<br />What: Rides and fair food.<br />Where: Cumming Fairgrounds, 235 Castleberry Road, Cumming, GA 30040.</p></div>
    <div><h4><b>Tuesday</b></h4></div>
    <div><p><a href="https://example.com/blood">American Red Cross Blood Drive</a><br />When: Tuesday, October 13, 2:00 PM – 7:00 PM<br />What: Give blood.<br />Where: Church, 1 Main Street, Cumming, GA 30040.<br /><br /><a href="https://example.com/trivia">Geek Speak: Family Trivia</a><br />When: Tuesday, October 13, 6:00 PM – 7:00 PM<br />What: Trivia.<br />Where: Library, 2 Main Street, Cumming, GA 30040.</p></div>`;

  const listings = extractListings(html, ISSUE_DATE);
  assert.deepEqual(
    listings.map((l) => [l.title, l.url, l.startDate]),
    [
      ["Books & Babies", "https://www.forsythpl.org/event/17109896", "2026-10-12"],
      ["Conversational English", "https://www.forsythpl.org/event/16644797", "2026-10-12"],
      ["Cumming Country Fair & Festival", "https://www.bigtickets.com/e/fair", "2026-10-12"],
      ["American Red Cross Blood Drive", "https://example.com/blood", "2026-10-13"],
      ["Geek Speak: Family Trivia", "https://example.com/trivia", "2026-10-13"],
    ]
  );
  assert.equal(listings[1].whereText, "Denmark Library, 530 Fowler Road, Alpharetta, GA 30004");
});
