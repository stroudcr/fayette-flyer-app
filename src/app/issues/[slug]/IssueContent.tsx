interface IssueContentProps {
  content: string;
}

export function IssueContent({ content }: IssueContentProps) {
  return (
    <div
      className="issue-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
