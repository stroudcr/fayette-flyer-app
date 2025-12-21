import Link from "next/link";
import Image from "next/image";
import type { Issue } from "@/lib/beehiiv/types";

interface IssueCardProps {
  issue: Issue;
  featured?: boolean;
}

export function IssueCard({ issue, featured = false }: IssueCardProps) {
  const formattedDate = issue.publishDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (featured) {
    return (
      <article className="card group">
        <Link href={`/issues/${issue.slug}`} className="block">
          {issue.thumbnailUrl && (
            <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-lg">
              <Image
                src={issue.thumbnailUrl}
                alt={issue.title}
                width={800}
                height={400}
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate mb-2">
            <time dateTime={issue.publishDate.toISOString()}>{formattedDate}</time>
            <span className="inline-block px-2 py-0.5 bg-gold/10 text-gold text-xs font-medium rounded">
              Latest
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-navy group-hover:text-navy-dark transition-colors mb-2">
            {issue.title}
          </h2>
          {issue.excerpt && (
            <p className="text-slate line-clamp-3">{issue.excerpt}</p>
          )}
          <div className="mt-4 text-navy font-medium text-sm group-hover:underline">
            Read this issue →
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="card group">
      <Link href={`/issues/${issue.slug}`} className="block">
        <div className="flex items-center gap-2 text-sm text-slate mb-2">
          <time dateTime={issue.publishDate.toISOString()}>{formattedDate}</time>
        </div>
        <h3 className="font-serif font-bold text-lg text-navy group-hover:text-navy-dark transition-colors mb-2">
          {issue.title}
        </h3>
        {issue.excerpt && (
          <p className="text-slate text-sm line-clamp-2">{issue.excerpt}</p>
        )}
      </Link>
    </article>
  );
}
