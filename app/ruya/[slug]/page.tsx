import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCachedDreamBySlug,
  getCachedRelatedDreamsFull,
} from "@/lib/cache";
import {
  generateSeoMetadata,
  generateArticleSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import DreamCard from "@/components/DreamCard";
import StructuredData from "@/components/StructuredData";
import MarkdownContent from "@/components/MarkdownContent";
import EditorNote from "@/components/EditorNote";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Link from "next/link";
import { generateFaq } from "@/lib/generators/faqGenerator";
import { injectContextualLinks } from "@/lib/linkInjector";
import { injectMicroVariation } from "@/lib/variationLayer";

export const dynamic = "force-static";
export const revalidate = 604800; // ISR: 7 days — serve from CDN edge cache

/**
 * Empty generateStaticParams = ISR-first strategy.
 * Build generates 0 pages → no build timeout on 45k records.
 * Each page is generated on first request, then cached for 7 days on CDN.
 * Google crawls normally; AdSense sees fully rendered HTML on every hit.
 */
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: { slug: string };
}

const ARTIFACT_PATTERN = /\b(lorem ipsum|undefined|null|nan)\b/i;
const RAW_HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

function sanitizeGeneratedContent(content: string): string {
  return content
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/\b(lorem ipsum|undefined|null|nan)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function hasContentArtifacts(content: string): boolean {
  return ARTIFACT_PATTERN.test(content) || RAW_HTML_TAG_PATTERN.test(content);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const dream = await getCachedDreamBySlug(params.slug);
  if (!dream) return {};

  const normalizedContent = dream.content
    ? sanitizeGeneratedContent(dream.content)
    : "";
  const effectiveWordCount =
    dream.wordCount ??
    (normalizedContent ? normalizedContent.split(/\s+/).filter(Boolean).length : 0);

  // Thin content guard: wordCount < 500 veya boş içerik → noindex
  const isThin = !normalizedContent || effectiveWordCount < 500;

  return generateSeoMetadata({
    title: `${dream.title} - Rüya Tabiri`,
    description: dream.metaDescription || `${dream.title} rüyasının anlamı, yorumu ve İslami ile psikolojik yorumlarıyla detaylı tabiri.`,
    path: `/ruya/${dream.slug}`,
    type: "article",
    noindex: isThin,
  });
}

export default async function DreamDetailPage({ params }: PageProps) {
  const dream = await getCachedDreamBySlug(params.slug);

  if (!dream) {
    notFound();
  }

  const relatedDreams = await getCachedRelatedDreamsFull(
    dream.id,
    dream.categoryId,
    dream.title
  );

  const normalizedContent = dream.content
    ? sanitizeGeneratedContent(dream.content)
    : "";
  const safeContent =
    dream.content && hasContentArtifacts(dream.content)
      ? normalizedContent
      : dream.content;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com";

  // unstable_cache JSON serialize eder; Date nesnelerini geri yükle
  const createdAt = new Date(dream.createdAt);
  const updatedAt = new Date(dream.updatedAt);

  // FAQ: başlık ve türe özgü sorular
  const faqData = generateFaq(dream.title, 4);

  const articleSchema = generateArticleSchema({
    title: dream.title,
    description: `${dream.title} rüya tabiri ve yorumu.`,
    url: `${siteUrl}/ruya/${dream.slug}`,
    datePublished: createdAt.toISOString(),
    dateModified: updatedAt.toISOString(),
  });

  const faqSchema = generateFaqSchema(
    faqData.map((f) => ({ question: f.question, answer: f.answer }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: dream.category.name, url: `/kategori/${dream.category.slug}` },
    { name: dream.title, url: `/ruya/${dream.slug}` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={breadcrumbSchema} />

      <article className="container-main py-8">
        <Breadcrumb
          items={[
            {
              label: dream.category.name,
              href: `/kategori/${dream.category.slug}`,
            },
            { label: dream.title },
          ]}
        />

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
          {dream.title}
        </h1>

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <Link
            href={`/kategori/${dream.category.slug}`}
            className="rounded-full bg-dream-light px-3 py-1 text-dream hover:bg-dream hover:text-white"
          >
            {dream.category.name}
          </Link>
          <span>{dream.views} görüntülenme</span>
          <time dateTime={updatedAt.toISOString()}>
            {updatedAt.toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        {/* Content */}
        <div className="mt-8">
          {safeContent ? (
            <MarkdownContent
              content={injectContextualLinks(
                injectMicroVariation(safeContent, dream.slug),
                relatedDreams.map((rd) => ({
                  title: rd.title,
                  slug: rd.slug,
                })),
                3,
                dream.slug
              )}
            />
          ) : (
            <p className="text-lg leading-relaxed text-gray-700">
              Bu rüya için henüz içerik oluşturulmamıştır.
            </p>
          )}

          {dream.shortSummary && (
            <div className="mt-6 rounded-xl border-l-4 border-dream bg-dream-light p-6">
              <h2 className="text-lg font-semibold text-dream-dark">
                Kısa Özet
              </h2>
              <p className="mt-2 text-gray-700">{dream.shortSummary}</p>
            </div>
          )}

          {/* YMYL Disclaimer */}
          <MedicalDisclaimer />

          {/* E-E-A-T editoryal notu */}
          <EditorNote
            categoryName={dream.category?.name}
            updatedAt={updatedAt}
          />
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Sıkça Sorulan Sorular
          </h2>
          <div className="mt-4 space-y-4">
            {faqData.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-gray-200 bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-gray-800">
                  {faq.question}
                  <svg
                    className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Related Dreams */}
        {relatedDreams.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              İlgili Rüya Tabirleri
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedDreams.map((rd) => (
                <DreamCard key={rd.id} title={rd.title} slug={rd.slug} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
