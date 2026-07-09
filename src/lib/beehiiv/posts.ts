import "server-only";
import {
  getPosts,
  getAllPosts,
  getPostBySlug,
  getPostById,
  hasBeehiivConfig,
} from "./client";
import type { BeehiivPost, Issue } from "./types";
import { cleanBeehiivContent } from "./content";

// Transform Beehiiv post to Issue format
function transformPost(post: BeehiivPost): Issue {
  const publishDate = post.publish_date
    ? new Date(post.publish_date * 1000)
    : new Date();

  // Prefer summary fields for cards; only fall back to full content when it
  // was already fetched for a detail page.
  let excerpt = post.subtitle || post.meta_default_description || "";
  if (!excerpt && post.content?.free?.web) {
    const textContent = post.content.free.web
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? "..." : "");
  }

  return {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug,
    publishDate,
    thumbnailUrl: post.thumbnail_url,
    excerpt,
    content: post.content?.free?.web
      ? cleanBeehiivContent(post.content.free.web)
      : undefined,
    authors: post.authors?.map((a) => ({
      name: a.name,
      avatar: a.profile_picture,
    })),
  };
}

export async function getLatestIssues(count: number = 6): Promise<Issue[]> {
  if (!hasBeehiivConfig()) {
    return [];
  }
  const response = await getPosts({ limit: count });
  return response.data.map(transformPost);
}

export async function getAllIssues(): Promise<Issue[]> {
  if (!hasBeehiivConfig()) {
    return [];
  }
  const posts = await getAllPosts();
  return posts.map(transformPost);
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  if (!hasBeehiivConfig()) {
    return null;
  }
  const post = await getPostBySlug(slug);
  return post ? transformPost(post) : null;
}

export async function getAdjacentIssues(
  currentSlug: string
): Promise<{ prev: Issue | null; next: Issue | null }> {
  const allIssues = await getAllIssues();
  const currentIndex = allIssues.findIndex((issue) => issue.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    // Previous = newer (lower index since sorted desc by date)
    prev: currentIndex > 0 ? allIssues[currentIndex - 1] : null,
    // Next = older (higher index)
    next: currentIndex < allIssues.length - 1 ? allIssues[currentIndex + 1] : null,
  };
}

export async function getIssuePageData(
  slug: string
): Promise<{
  issue: Issue | null;
  adjacent: { prev: Issue | null; next: Issue | null };
}> {
  if (!hasBeehiivConfig()) {
    return {
      issue: null,
      adjacent: { prev: null, next: null },
    };
  }

  const posts = await getAllPosts();
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) {
    return {
      issue: null,
      adjacent: { prev: null, next: null },
    };
  }

  const fullPost = await getPostById(posts[currentIndex].id);

  return {
    issue: transformPost(fullPost),
    adjacent: {
      prev: currentIndex > 0 ? transformPost(posts[currentIndex - 1]) : null,
      next: currentIndex < posts.length - 1 ? transformPost(posts[currentIndex + 1]) : null,
    },
  };
}
