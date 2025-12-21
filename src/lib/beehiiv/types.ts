// Beehiiv API Types

export interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  status: "draft" | "confirmed" | "archived";
  publish_date?: number; // Unix timestamp
  displayed_date?: number;
  created?: number;
  audience: "free" | "premium" | "both";
  platform: "web" | "email" | "both";
  thumbnail_url?: string;
  web_url?: string;
  content?: {
    free?: {
      web?: string;
      email?: string;
      rss?: string;
    };
    premium?: {
      web?: string;
      email?: string;
    };
  };
  authors?: {
    id: string;
    name?: string;
    profile_picture?: string;
    bio?: string;
  }[];
  meta_default_title?: string;
  meta_default_description?: string;
}

export interface BeehiivPostsResponse {
  data: BeehiivPost[];
  limit: number;
  page: number;
  total_results: number;
  total_pages: number;
}

export interface BeehiivSubscriptionCreate {
  email: string;
  reactivate_existing?: boolean;
  send_welcome_email?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referring_site?: string;
  custom_fields?: Record<string, string>;
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: "active" | "inactive" | "validating" | "invalid" | "pending";
  created?: number;
}

export interface BeehiivSubscriptionResponse {
  data: BeehiivSubscription;
}

export interface BeehiivError {
  error: string;
  message: string;
}

// Transformed types for the application
export interface Issue {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  publishDate: Date;
  thumbnailUrl?: string;
  excerpt?: string;
  content?: string;
  authors?: {
    name?: string;
    avatar?: string;
  }[];
}
