import { markdownToHtml } from "@/utils/markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * content-generator.ts çıktısını Markdown → HTML olarak render eder.
 * Server component — "use client" kullanılmaz.
 */
export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  const html = markdownToHtml(content);

  return (
    <div
      className={`markdown-content prose prose-sm sm:prose-base lg:prose-lg prose-gray max-w-none focus:outline-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
