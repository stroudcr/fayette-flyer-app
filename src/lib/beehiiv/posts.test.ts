import assert from "node:assert/strict";
import test from "node:test";
import { getPosts } from "./client.ts";
import { getIssueBySlug, getIssuePageData, getLatestIssues } from "./posts.ts";
import type { BeehiivPost, BeehiivPostsResponse } from "./types.ts";

const API_PREFIX = "/v2/publications/pub_test";

type FetchCall = {
  url: URL;
  init?: RequestInit;
};

type FetchHandler = (url: URL, init?: RequestInit) => unknown;

function useBeehiivEnv() {
  process.env.BEEHIIV_API_KEY = "test_key";
  process.env.BEEHIIV_PUBLICATION_ID = "pub_test";
}

function postsResponse(data: BeehiivPost[]): BeehiivPostsResponse {
  return {
    data,
    limit: data.length,
    page: 1,
    total_results: data.length,
    total_pages: 1,
  };
}

function mockFetch(handler: FetchHandler) {
  const originalFetch = globalThis.fetch;
  const calls: FetchCall[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    calls.push({ url, init });

    const body = handler(url, init);
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return {
    calls,
    restore() {
      globalThis.fetch = originalFetch;
    },
  };
}

test("Beehiiv list calls are lightweight by default", async () => {
  useBeehiivEnv();
  const fetchMock = mockFetch(() => postsResponse([]));

  try {
    await getPosts({ limit: 6 });

    assert.equal(fetchMock.calls.length, 1);
    assert.equal(fetchMock.calls[0].url.pathname, `${API_PREFIX}/posts`);
    assert.equal(fetchMock.calls[0].url.searchParams.get("limit"), "6");
    assert.equal(fetchMock.calls[0].url.searchParams.has("expand[]"), false);
  } finally {
    fetchMock.restore();
  }
});

test("slug lookup fetches a lightweight list and one expanded post", async () => {
  useBeehiivEnv();
  const fetchMock = mockFetch((url) => {
    if (url.pathname === `${API_PREFIX}/posts`) {
      assert.equal(url.searchParams.has("expand[]"), false);
      return postsResponse([
        {
          id: "post_1",
          title: "Round of Robins",
          subtitle: "Spring is close",
          slug: "round-of-robins",
          status: "confirmed",
          audience: "free",
          platform: "both",
          publish_date: 1771239852,
        },
      ]);
    }

    assert.equal(url.pathname, `${API_PREFIX}/posts/post_1`);
    assert.deepEqual(url.searchParams.getAll("expand[]"), ["free_web_content"]);
    return {
      data: {
        id: "post_1",
        title: "Round of Robins",
        subtitle: "Spring is close",
        slug: "round-of-robins",
        status: "confirmed",
        audience: "free",
        platform: "both",
        publish_date: 1771239852,
        content: { free: { web: "<p>Hello Fayette</p>" } },
      },
    };
  });

  try {
    const issue = await getIssueBySlug("round-of-robins");

    assert.equal(fetchMock.calls.length, 2);
    assert.equal(issue?.title, "Round of Robins");
    assert.match(issue?.content || "", /Hello Fayette/);
  } finally {
    fetchMock.restore();
  }
});

test("issue page data fetches full content once and keeps adjacent links lightweight", async () => {
  useBeehiivEnv();
  const fetchMock = mockFetch((url) => {
    if (url.pathname === `${API_PREFIX}/posts`) {
      return postsResponse([
        {
          id: "post_newer",
          title: "Newer Issue",
          slug: "newer-issue",
          status: "confirmed",
          audience: "free",
          platform: "both",
          publish_date: 1771326252,
        },
        {
          id: "post_current",
          title: "Current Issue",
          slug: "current-issue",
          status: "confirmed",
          audience: "free",
          platform: "both",
          publish_date: 1771239852,
        },
        {
          id: "post_older",
          title: "Older Issue",
          slug: "older-issue",
          status: "confirmed",
          audience: "free",
          platform: "both",
          publish_date: 1771153452,
        },
      ]);
    }

    assert.equal(url.pathname, `${API_PREFIX}/posts/post_current`);
    return {
      data: {
        id: "post_current",
        title: "Current Issue",
        slug: "current-issue",
        status: "confirmed",
        audience: "free",
        platform: "both",
        publish_date: 1771239852,
        content: { free: { web: "<article><p>Full issue body</p></article>" } },
      },
    };
  });

  try {
    const pageData = await getIssuePageData("current-issue");

    assert.equal(fetchMock.calls.length, 2);
    assert.match(pageData.issue?.content || "", /Full issue body/);
    assert.equal(pageData.adjacent.prev?.slug, "newer-issue");
    assert.equal(pageData.adjacent.next?.slug, "older-issue");
    assert.equal(pageData.adjacent.prev?.content, undefined);
    assert.equal(pageData.adjacent.next?.content, undefined);
  } finally {
    fetchMock.restore();
  }
});

test("summary issues preserve excerpts from subtitle or metadata", async () => {
  useBeehiivEnv();
  const fetchMock = mockFetch(() =>
    postsResponse([
      {
        id: "post_subtitle",
        title: "Subtitle Issue",
        subtitle: "Subtitle excerpt",
        slug: "subtitle-issue",
        status: "confirmed",
        audience: "free",
        platform: "both",
      },
      {
        id: "post_meta",
        title: "Metadata Issue",
        meta_default_description: "Metadata excerpt",
        slug: "metadata-issue",
        status: "confirmed",
        audience: "free",
        platform: "both",
      },
    ])
  );

  try {
    const issues = await getLatestIssues(2);

    assert.equal(fetchMock.calls.length, 1);
    assert.equal(fetchMock.calls[0].url.searchParams.has("expand[]"), false);
    assert.equal(issues[0].excerpt, "Subtitle excerpt");
    assert.equal(issues[1].excerpt, "Metadata excerpt");
  } finally {
    fetchMock.restore();
  }
});
