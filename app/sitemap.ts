import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com";

function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const SITE_URL = normalizeSiteUrl(RAW_SITE_URL);

const MAX_URLS_PER_SITEMAP = 10000;

/**
 * Sitemap Index — birden fazla child sitemap'e yönlendirir.
 * Google 45k+ URL'yi tek sitemap'te tolere etmez; bu nedenle
 * /sitemap/0.xml, /sitemap/1.xml, ... şeklinde bölünmüştür.
 *
 * Next.js generateSitemaps() ile sitemap index otomatik oluşturulur.
 */
export async function generateSitemaps() {
  const totalDreams = await prisma.dream.count({
    where: { isPublished: true },
  });

  const childCount = Math.ceil(totalDreams / MAX_URLS_PER_SITEMAP);

  // id: 0 → static + category pages
  // id: 1..N → dream pages
  const ids = [{ id: 0 }];
  for (let i = 1; i <= childCount; i++) {
    ids.push({ id: i });
  }

  return ids;
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // id=0 → static + category pages
  if (id === 0) {
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${SITE_URL}/ara`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/hakkinda`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/iletisim`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/gizlilik-politikasi`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/kullanim-kosullari`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
      },
    ];

    const categories = await prisma.category.findMany({
      select: { slug: true },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${SITE_URL}/kategori/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...categoryPages];
  }

  // id=1..N → dream pages (paginated)
  const skip = (id - 1) * MAX_URLS_PER_SITEMAP;

  const dreams = await prisma.dream.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true, views: true },
    skip,
    take: MAX_URLS_PER_SITEMAP,
    orderBy: { id: "asc" },
  });

  return dreams.map((dream) => ({
    url: `${SITE_URL}/ruya/${dream.slug}`,
    lastModified: dream.updatedAt,
    changeFrequency: "monthly" as const,
    // Views > 50 → yüksek öncelik: Googlebot crawl budget'ını popüler içeriklere ayırır
    priority: dream.views > 50 ? 0.8 : 0.6,
  }));
}
