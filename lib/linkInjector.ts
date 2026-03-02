/**
 * linkInjector.ts — Render zamanında DB-tabanlı iç link enjeksiyonu
 *
 * Rüya detay sayfasında markdown içeriğe 2-3 bağlamsal iç link ekler.
 * Linkler YALNIZCA DB'de mevcut olan rüyalardan çekilir — kırık link riski sıfırdır.
 *
 * Kurallar:
 *  - Maksimum 3 link / sayfa
 *  - İlk paragrafta link eklenmez
 *  - Doğal Türkçe bağlantı cümleleri kullanılır
 *  - Mevcut sayfanın slug'ı filtrelenir (self-link guard)
 *  - Aynı slug birden fazla eklenmez (dedup guard)
 *  - İlgili rüya sayısı < 2 ise link eklenmez (kalite guard)
 *  - Anchor text varyasyonu uygulanır
 */

interface RelatedDreamLink {
  title: string;
  slug: string;
}

// Her template farklı bir anchor text formatı kullanır — tam başlık tekrarı kırılır
const LINK_TEMPLATES = [
  (title: string, slug: string, short: string) =>
    `Benzer bir perspektifle [${short} rüyası](/ruya/${slug}) da değerlendirilebilir.`,
  (title: string, slug: string, short: string) =>
    `Bu bağlamda [${title}](/ruya/${slug}) rüyasının anlamını da incelemenizi öneriyoruz.`,
  (title: string, slug: string, short: string) =>
    `Konuyla ilişkili olarak [${short} tabiri](/ruya/${slug}) de göz atılmaya değerdir.`,
  (title: string, slug: string, short: string) =>
    `İlgili semboller arasında [${title} rüya tabiri](/ruya/${slug}) öne çıkmaktadır.`,
  (title: string, slug: string, short: string) =>
    `Ayrıca [${short} rüyasının anlamı](/ruya/${slug}) da bütünsel bir bakış sağlar.`,
];

/**
 * Başlıktan kısa anchor formu üretir.
 * "Rüyada Yılan Görmek" → "yılan görmek"
 */
function shortenTitle(title: string): string {
  return title
    .replace(/^rüyada\s+/i, "")
    .replace(/^rüyasında\s+/i, "")
    .trim() || title;
}

/**
 * Markdown içeriğe bağlamsal iç linkler ekler.
 *
 * @param markdown     DB'den gelen rüya içeriği
 * @param related      DB'den çekilen ilgili rüyalar (findRelatedDreams çıktısı)
 * @param maxLinks     Eklenecek maksimum link sayısı (varsayılan: 3)
 * @param currentSlug  Mevcut sayfanın slug'ı — self-link guard için
 * @returns            Link enjekte edilmiş markdown
 */
export function injectContextualLinks(
  markdown: string,
  related: RelatedDreamLink[],
  maxLinks = 3,
  currentSlug?: string
): string {
  if (!related || related.length === 0) return markdown;

  // Self-link guard: mevcut sayfanın slug'ını filtrele
  let filtered = currentSlug
    ? related.filter((r) => r.slug !== currentSlug)
    : related;

  // Dedup guard: aynı slug'ı birden fazla ekleme
  const seen = new Set<string>();
  filtered = filtered.filter((r) => {
    if (seen.has(r.slug)) return false;
    seen.add(r.slug);
    return true;
  });

  // Kalite guard: en az 2 ilgili rüya yoksa link ekleme — zayıf link kötüdür
  if (filtered.length < 2) return markdown;

  // Paragrafları böl (çift newline)
  const paragraphs = markdown.split(/\n{2,}/);

  // En az 3 paragraf yoksa link eklemeye değmez
  if (paragraphs.length < 3) return markdown;

  // Eklenecek link sayısını belirle
  const linkCount = Math.min(maxLinks, filtered.length, LINK_TEMPLATES.length);
  const linksToInsert = filtered.slice(0, linkCount);

  // İlk paragrafı (intro) atla, sonraki paragraflara link ekle
  // Her --- (bölüm ayracı) sonrasına veya paragraf sonuna link ekle
  let insertedCount = 0;
  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    result.push(paragraphs[i]);

    // İlk 2 paragrafı atla (intro + başlık)
    if (i < 2) continue;

    // Bölüm ayracından hemen sonrasına ekleme
    if (paragraphs[i].trim() === "---") continue;

    // Zaten bir bölüm başlığıysa ekleme
    if (paragraphs[i].trim().startsWith("#")) continue;

    // Link ekleme noktası
    if (insertedCount < linksToInsert.length) {
      const link = linksToInsert[insertedCount];
      const seed = (link.slug.length + i) % LINK_TEMPLATES.length;
      const short = shortenTitle(link.title);
      const linkSentence = LINK_TEMPLATES[seed](link.title, link.slug, short);
      result.push(`\n${linkSentence}`);
      insertedCount++;
    }
  }

  return result.join("\n\n");
}

export default injectContextualLinks;
