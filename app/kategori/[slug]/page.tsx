import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCachedCategoryBySlug,
  getCachedDreamsByCategory,
  getCachedCategories,
} from "@/lib/cache";
import { generateSeoMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import DreamCard from "@/components/DreamCard";
import Pagination from "@/components/Pagination";
import StructuredData from "@/components/StructuredData";
import Link from "next/link";

export const revalidate = 300;

const PER_PAGE = 30;

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const category = await getCachedCategoryBySlug(params.slug);
  if (!category) return {};

  return generateSeoMetadata({
    title: `${category.name} Rüya Tabirleri`,
    description: `${category.name} ile ilgili rüya tabirleri ve yorumları. ${category.name} kategorisindeki rüyaların anlamlarını keşfedin.`,
    path: `/kategori/${category.slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCachedCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const { dreams, total } = await getCachedDreamsByCategory(
    category.id,
    page,
    PER_PAGE
  );
  const totalPages = Math.ceil(total / PER_PAGE);

  // Get all categories for sidebar
  const allCategories = await getCachedCategories();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: category.name, url: `/kategori/${category.slug}` },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />

      <div className="container-main py-8">
        <Breadcrumb items={[{ label: category.name }]} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Categories */}
          <aside className="order-2 lg:order-1 lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Kategoriler
              </h3>
              <nav className="space-y-1">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      cat.slug === params.slug
                        ? "bg-dream text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-xs ${cat.slug === params.slug ? "text-white/80" : "text-gray-400"}`}
                    >
                      {cat._count.dreams}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {category.name} Rüya Tabirleri
            </h1>
            <p className="mt-2 text-gray-500">
              {total} rüya tabiri bulundu • Sayfa {page}/{totalPages}
            </p>

            {category.seoText && (
              <p className="mt-4 text-gray-600">{category.seoText}</p>
            )}

            {/* Dreams Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  title={dream.title}
                  slug={dream.slug}
                  summary={dream.shortSummary}
                />
              ))}
            </div>

            {/* Empty State */}
            {dreams.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-lg text-gray-500">
                  Bu kategoride henüz rüya tabiri bulunmamaktadır.
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/kategori/${category.slug}`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
