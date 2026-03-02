import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCachedPopularDreams, getCachedCategories } from "@/lib/cache";
import DreamCard from "@/components/DreamCard";
import StructuredData from "@/components/StructuredData";

export const revalidate = 60; // ISR: 1 minute (quick update)

export default async function HomePage() {
  const [popularDreams, categories] = await Promise.all([
    getCachedPopularDreams(),
    getCachedCategories(),
  ]);

  // Get recent dreams
  const recentDreams = await prisma.dream.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, title: true, slug: true, shortSummary: true },
  });

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rüya Bilinci",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com",
    description:
      "Türkiye'nin en kapsamlı rüya tabirleri sitesi. 45.000+ rüya tabiri ve yorumu.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com"}/ara?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <StructuredData data={websiteSchema} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dream-light via-white to-primary-50 py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            <span className="text-dream">Rüya Bilinci</span> ve Yorumları
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            250.000&apos;den fazla rüya tabiri ile rüyalarınızın anlamını
            keşfedin. Detaylı rüya yorumları ve tabirleri.
          </p>

          {/* Search Box */}
          <form
            action="/ara"
            method="GET"
            className="mx-auto mt-8 max-w-xl"
          >
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Rüyanızda ne gördünüz? (örn: yılan, su, uçmak)"
                className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 pr-14 text-lg shadow-lg focus:border-dream focus:outline-none focus:ring-2 focus:ring-dream/20"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-dream p-2.5 text-white transition-colors hover:bg-dream-dark"
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
        </div>
      </section>

      {/* Categories Section */}
      <section className="container-main py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Rüya Kategorileri
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-all hover:border-dream hover:shadow-md"
            >
              <span className="text-sm font-medium text-gray-700">
                {cat.name}
              </span>
              <span className="mt-1 block text-xs text-gray-400">
                {cat._count.dreams} rüya
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Dreams */}
      <section className="bg-gray-50 py-12">
        <div className="container-main">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Popüler Rüya Tabirleri
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularDreams.map((dream) => (
              <DreamCard key={dream.id} title={dream.title} slug={dream.slug} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Dreams */}
      <section className="container-main py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Son Eklenen Rüya Tabirleri
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentDreams.map((dream) => (
            <DreamCard
              key={dream.id}
              title={dream.title}
              slug={dream.slug}
              summary={dream.shortSummary}
            />
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container-main">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Rüya Tabirleri Nedir?
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600">
              Rüya tabirleri, uyku sırasında görülen rüyaların anlamlarının
              yorumlanmasıdır. Yüzyıllardır insanlar rüyalarının ne anlama
              geldiğini merak etmiş ve çeşitli kaynaklara başvurmuştur.
              Sitemizde İslami rüya tabircileri başta olmak üzere, psikolojik
              ve kültürel rüya yorumlarını bulabilirsiniz.
            </p>
            <p className="mt-3 text-gray-600">
              250.000&apos;den fazla rüya tabiri içeren veritabanımız ile
              rüyanızda gördüğünüz her şeyin anlamını öğrenebilirsiniz. Rüyada
              yılan görmek, rüyada su görmek, rüyada altın görmek gibi en çok
              aranan rüya tabirlerini detaylı açıklamalarıyla bulabilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
