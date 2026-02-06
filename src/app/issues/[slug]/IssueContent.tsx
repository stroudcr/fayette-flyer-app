"use client";

interface IssueContentProps {
  content: string;
}

export function IssueContent({ content }: IssueContentProps) {
  return (
    <div
      className="prose prose-lg prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
