import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { generateSeoMetadata } from "@/lib/seo";
import DreamCard from "@/components/DreamCard";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = generateSeoMetadata({
  title: "Rüya Ara - Rüya Tabirleri Arama",
  description:
    "Rüyanızda gördüklerinizi arayın ve detaylı rüya tabirlerini keşfedin.",
  path: "/ara",
});

const PER_PAGE = 20;

interface PageProps {
  searchParams: { q?: string; page?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  let dreams: { id: number; title: string; slug: string; shortSummary: string | null }[] = [];
  let total = 0;

  if (query) {
    [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where: {
          isPublished: true,
          title: { contains: query, mode: "insensitive" },
        },
        orderBy: { views: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: { id: true, title: true, slug: true, shortSummary: true },
      }),
      prisma.dream.count({
        where: {
          isPublished: true,
          title: { contains: query, mode: "insensitive" },
        },
      }),
    ]);
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: "Rüya Ara" }]} />

      <h1 className="text-3xl font-extrabold text-gray-900">Rüya Ara</h1>
      <p className="mt-2 text-gray-500">
        Rüyanızda gördüklerinizi arayın ve tabirini öğrenin.
      </p>

      {/* Search Form */}
      <form action="/ara" method="GET" className="mt-6">
        <div className="relative max-w-2xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Rüyanızda ne gördünüz? (örn: yılan, su, uçmak, altın)"
            className="w-full rounded-xl border-2 border-gray-200 px-5 py-4 pr-14 text-lg focus:border-dream focus:outline-none focus:ring-2 focus:ring-dream/20"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-dream p-2.5 text-white hover:bg-dream-dark"
            aria-label="Ara"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Results */}
      {query && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-gray-500">
            <span className="font-medium text-gray-800">
              &quot;{query}&quot;
            </span>{" "}
            için {total} sonuç bulundu
          </p>

          {dreams.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dreams.map((dream) => (
                  <DreamCard
                    key={dream.id}
                    title={dream.title}
                    slug={dream.slug}
                    summary={dream.shortSummary}
                  />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={`/ara?q=${encodeURIComponent(query)}`}
              />
            </>
          ) : (
            <div className="mt-12 text-center">
              <div className="text-6xl">🔍</div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                Sonuç bulunamadı
              </h2>
              <p className="mt-2 text-gray-500">
                &quot;{query}&quot; ile eşleşen rüya tabiri bulunamadı.
                Farklı kelimeler deneyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Popular Searches when no query */}
      {!query && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900">
            Popüler Aramalar
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Yılan",
              "Su",
              "Altın",
              "Bebek",
              "Araba",
              "Köpek",
              "Kedi",
              "Ölüm",
              "Düğün",
              "Para",
              "Uçmak",
              "Diş",
              "Kan",
              "Namaz",
              "Ağlamak",
              "Kavga",
              "Deniz",
              "Yağmur",
              "Deprem",
              "Cenaze",
            ].map((term) => (
              <a
                key={term}
                href={`/ara?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-dream hover:text-dream"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
