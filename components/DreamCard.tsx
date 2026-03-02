import Link from "next/link";

interface DreamCardProps {
  title: string;
  slug: string;
  summary?: string | null;
}

export default function DreamCard({ title, slug, summary }: DreamCardProps) {
  return (
    <Link href={`/ruya/${slug}`} className="card group block">
      <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-dream">
        {title}
      </h3>
      {summary && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{summary}</p>
      )}
      <span className="mt-3 inline-flex items-center text-sm font-medium text-dream">
        Tabiri Oku
        <svg
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
    </Link>
  );
}
