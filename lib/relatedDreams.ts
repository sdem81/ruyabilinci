/**
 * Related Dreams
 * Gerçek DB sorgusuyla ilgili rüyaları bulur.
 * Hiç bir zaman 404 linki oluşturmaz.
 */

import { prisma } from "./prisma";

export interface RelatedDream {
  id: number;
  title: string;
  slug: string;
}

/**
 * Verilen rüya ile aynı kategoride, en çok görüntülenen 6 rüyayı döndürür.
 * Birincil: aynı kategori + yüksek görüntüleme
 * Fallback: en yeni yayınlanmış rüyalar (kategori bulunamaz veya yetersizse)
 *
 * @never throws - her hata durumunda boş dizi döner
 */
export async function findRelatedDreams(
  dreamId: number,
  categoryId: number | null | undefined,
  _title: string,
  limit = 6
): Promise<RelatedDream[]> {
  try {
    let results: RelatedDream[] = [];

    // 1. Aynı kategoriden al
    if (categoryId) {
      const rows = await prisma.dream.findMany({
        where: {
          isPublished: true,
          categoryId: categoryId,
          id: { not: dreamId },
        },
        select: { id: true, title: true, slug: true },
        orderBy: { views: "desc" },
        take: limit,
      });
      results = rows;
    }

    // 2. Yetersizse genel fallback (en son yayınlananlar)
    if (results.length < 3) {
      const fallback = await prisma.dream.findMany({
        where: {
          isPublished: true,
          id: { not: dreamId },
        },
        select: { id: true, title: true, slug: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // Tekrarları çıkar
      const existing = new Set(results.map((r) => r.id));
      for (const row of fallback) {
        if (!existing.has(row.id) && results.length < limit) {
          results.push(row);
          existing.add(row.id);
        }
      }
    }

    return results.slice(0, limit);
  } catch {
    // Hata durumunda boş dizi — hiçbir zaman fırlatma
    return [];
  }
}

export default findRelatedDreams;
