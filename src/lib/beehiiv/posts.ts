import "server-only";
import { getPosts, getAllPosts, getPostBySlug } from "./client";
import type { BeehiivPost, Issue } from "./types";

// Transform Beehiiv post to Issue format
function transformPost(post: BeehiivPost): Issue {
  const publishDate = post.publish_date
    ? new Date(post.publish_date * 1000)
    : new Date();

  // Extract excerpt from content or use subtitle
  let excerpt = post.subtitle || "";
  if (!excerpt && post.content?.free?.web) {
    // Strip HTML and take first 200 chars
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
    content: post.content?.free?.web,
    authors: post.authors?.map((a) => ({
      name: a.name,
      avatar: a.profile_picture,
    })),
  };
}

export async function getLatestIssues(count: number = 6): Promise<Issue[]> {
  const response = await getPosts({ limit: count });
  return response.data.map(transformPost);
}

export async function getAllIssues(): Promise<Issue[]> {
  const posts = await getAllPosts();
  return posts.map(transformPost);
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
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
