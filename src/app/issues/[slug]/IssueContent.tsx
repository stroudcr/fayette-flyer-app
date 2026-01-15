"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

interface IssueContentProps {
  content: string;
}

export function IssueContent({ content }: IssueContentProps) {
  const sanitizedContent = useMemo(() => {
    if (typeof window === "undefined") {
      return content;
    }
    return DOMPurify.sanitize(content);
  }, [content]);

  return (
    <div
      className="prose prose-lg prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
