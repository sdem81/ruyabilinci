import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { findRelatedDreams } from "./relatedDreams";

// Cache related dreams by dreamId+categoryId
export const getCachedRelatedDreamsFull = unstable_cache(
  async (dreamId: number, categoryId: number, title: string) => {
    return findRelatedDreams(dreamId, categoryId, title);
  },
  ["related-dreams-full"],
  { revalidate: 86400, tags: ["dreams"] } // 24 saat
);

// Cache dream by slug for 1 hour
export const getCachedDreamBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.dream.findUnique({
      where: { slug, isPublished: true },
      include: { category: true },
    });
  },
  ["dream-by-slug"],
  { revalidate: 3600, tags: ["dreams"] }
);

// Cache related dreams
export const getCachedRelatedDreams = unstable_cache(
  async (categoryId: number, excludeId: number) => {
    return prisma.dream.findMany({
      where: {
        categoryId,
        isPublished: true,
        id: { not: excludeId },
      },
      take: 6,
      orderBy: { views: "desc" },
      select: { id: true, title: true, slug: true },
    });
  },
  ["related-dreams"],
  { revalidate: 3600, tags: ["dreams"] }
);

// Cache popular dreams for homepage
export const getCachedPopularDreams = unstable_cache(
  async () => {
    return prisma.dream.findMany({
      where: { isPublished: true },
      orderBy: { views: "desc" },
      take: 20,
      select: { id: true, title: true, slug: true },
    });
  },
  ["popular-dreams"],
  { revalidate: 1800, tags: ["dreams"] }
);

// Cache categories with dream counts
export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      include: { _count: { select: { dreams: true } } },
      orderBy: { name: "asc" },
    });
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);

// Cache category by slug
export const getCachedCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug },
    });
  },
  ["category-by-slug"],
  { revalidate: 3600, tags: ["categories"] }
);

// Cache dreams by category with pagination
export const getCachedDreamsByCategory = unstable_cache(
  async (categoryId: number, page: number, perPage: number) => {
    const [dreams, total] = await Promise.all([
      prisma.dream.findMany({
        where: { categoryId, isPublished: true },
        orderBy: { title: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: { id: true, title: true, slug: true, shortSummary: true },
      }),
      prisma.dream.count({
        where: { categoryId, isPublished: true },
      }),
    ]);
    return { dreams, total };
  },
  ["dreams-by-category"],
  { revalidate: 3600, tags: ["dreams"] }
);
