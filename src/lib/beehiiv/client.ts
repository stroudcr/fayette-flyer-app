import "server-only";
import type {
  BeehiivPostsResponse,
  BeehiivPost,
  BeehiivSubscriptionCreate,
  BeehiivSubscriptionResponse,
} from "./types";

const BEEHIIV_API_URL = "https://api.beehiiv.com/v2";

export function hasBeehiivConfig(): boolean {
  return Boolean(process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID);
}

function getApiKey(): string {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) {
    throw new Error("BEEHIIV_API_KEY environment variable is not set");
  }
  return apiKey;
}

function getPublicationId(): string {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    throw new Error("BEEHIIV_PUBLICATION_ID environment variable is not set");
  }
  return publicationId;
}

const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Honors Beehiiv's Retry-After header, otherwise backs off 1s, 2s, 4s. */
function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter, 10) * 1000;
  }
  return 1000 * 2 ** attempt;
}

async function beehiivFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  const publicationId = getPublicationId();

  const url = `${BEEHIIV_API_URL}/publications/${publicationId}${endpoint}`;
  const isRead = !options.method || options.method.toUpperCase() === "GET";

  let response: Response;
  for (let attempt = 0; ; attempt++) {
    response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Beehiiv rate-limits bursts (429). Wait and retry reads a few times
    // instead of failing the page, or the whole build.
    const retryable = response.status === 429 || response.status >= 500;
    if (!isRead || !retryable || attempt >= MAX_RETRIES) break;
    await sleep(retryDelayMs(response, attempt));
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (process.env.NODE_ENV === "development") {
      console.error(`Beehiiv API error: ${response.status} - ${errorText}`);
    }
    throw new Error(`Beehiiv API error: ${response.status}`);
  }

  return response.json();
}

export async function getPosts(
  options: {
    page?: number;
    limit?: number;
    status?: "draft" | "confirmed" | "archived";
    expand?: string[];
  } = {}
): Promise<BeehiivPostsResponse> {
  const {
    page = 1,
    limit = 10,
    status = "confirmed",
    expand = [],
  } = options;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
    platform: "both",
    order_by: "publish_date",
    direction: "desc",
  });

  expand.forEach((e) => params.append("expand[]", e));

  return beehiivFetch<BeehiivPostsResponse>(`/posts?${params.toString()}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
}

export async function getPostBySlug(
  slug: string
): Promise<BeehiivPost | null> {
  // Beehiiv doesn't have a direct slug lookup, so find the lightweight
  // summary first, then fetch full content for the single matching post.
  const allPosts = await getAllPosts();
  const post = allPosts.find((post) => post.slug === slug);
  return post ? getPostById(post.id) : null;
}

export async function getPostById(id: string): Promise<BeehiivPost> {
  return beehiivFetch<{ data: BeehiivPost }>(`/posts/${id}?expand[]=free_web_content`, {
    next: { revalidate: 300 },
  }).then((res) => res.data);
}

export async function getAllPosts(): Promise<BeehiivPost[]> {
  const allPosts: BeehiivPost[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getPosts({ page, limit: 50 });
    allPosts.push(...response.data);
    hasMore = page < response.total_pages;
    page++;
  }

  return allPosts;
}

export async function createSubscription(
  data: BeehiivSubscriptionCreate
): Promise<BeehiivSubscriptionResponse> {
  return beehiivFetch<BeehiivSubscriptionResponse>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
