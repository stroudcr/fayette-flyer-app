import type { Metadata } from "next";
import { DEFAULT_OG_MEDIA, SITE_CONFIG } from "@/lib/seo/constants";
import { absoluteUrl } from "./index";

/** Page metadata for guide pages, with an absolute title and full Open Graph. */
export function guideMetadata({
  title,
  description,
  path,
  index = true,
  image,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: { url: string; alt: string };
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: SITE_CONFIG.locale,
      url,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: image ? [{ url: image.url, alt: image.alt }] : DEFAULT_OG_MEDIA.images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image?.url ?? SITE_CONFIG.defaultOgVideoPoster],
    },
  };
}
