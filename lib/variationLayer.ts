/**
 * variationLayer.ts — Mikro-varyasyon enjeksiyonu
 *
 * Scaled-content parmak izini kırmak için paragraflar arasına
 * 1-2 kısa, doğal Türkçe ara cümlesi ekler.
 *
 * Kurallar:
 *  - Deterministik (slug-bazlı seed) → ISR cache-uyumlu
 *  - İlk paragrafta (giriş) DEĞİŞİKLİK YAPILMAZ
 *  - Sayfa başına en fazla 2 enjeksiyon
 *  - Cümleler 8-15 kelime, bilgi içerikli (boş dolgu değil)
 */

// ─── Deterministik seed ──────────────────────────────────────────────────────

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ─── Mikro-varyasyon cümle havuzu ────────────────────────────────────────────
// Kültürel, psikolojik veya pratik kısa notlar — SEO değeri olan bilgi içerir

const MICRO_CLAUSES: string[] = [
  "Rüya araştırmalarına göre tekrar eden semboller genellikle çözümlenmemiş bir iç meseleye işaret eder.",
  "Modern nörobilim, rüyaların duygusal hafıza konsolidasyonundaki rolünü giderek daha fazla vurgulamaktadır.",
  "Rüya sırasında hissedilen duygu, sembolün kendisinden daha belirleyici bir yorum kriteri olabilir.",
  "İbn Sirin'e göre rüyayı görenin niyeti ve ahlaki durumu, tabirde sembolden önce gelir.",
  "Klinik uygulamalarda rüya günlüğü tutmanın farkındalığı artırdığı gözlemlenmiştir.",
  "Jungcu analitik psikolojide her rüya figürü, rüyayı görenin bir iç parçasını temsil eder.",
  "REM uykusu sırasında beynin duygusal düzenleme kapasitesinin arttığı bilinmektedir.",
  "Geleneksel Anadolu yorumlarında rüyanın görüldüğü gece de tabirde önemli bir değişken olarak kabul edilir.",
  "Araştırmalar, dış stresi yüksek dönemlerde canlı rüya görme sıklığının belirgin biçimde arttığını göstermektedir.",
  "Gestalt yaklaşımına göre rüyadaki her nesne ve figür, kişinin projeksiyonlarını yansıtır.",
  "İslami gelenekte sabah namazından önce görülen rüyalar daha kıymetli sayılır.",
  "Bilişsel-davranışçı terapide kâbus tedavisinde imajinal tekrar yöntemi başarıyla uygulanmaktadır.",
  "Rüya sembollerinin evrensel bir anlamı yoktur; kültürel ve bireysel bağlam tabirde önceliklidir.",
  "Uyku kalitesinin artırılması, rüyaların hatırlanma oranını ve netliğini doğrudan etkiler.",
  "Tasavvuf geleneğinde manevi rüyaların ancak ehil bir kişiye anlatılması tavsiye edilir.",
  "Rüya sırasındaki bedensel duyumlar — düşme hissi, sıcak, soğuk — psikolojik alt yapıyla ilişkilidir.",
  "Freud, rüyaları 'bilinçdışına giden kraliyet yolu' olarak tanımlamıştır.",
  "Rüya tabiri bireysel bir süreçtir; aynı sembol farklı kişilerde farklı anlamlara gelebilir.",
  "Uyku hijyeni ve düzenli biyolojik saat, rüya kalitesini iyileştiren temel faktörler arasındadır.",
  "Psikoanalitik kuramlara göre rüya işi, bastırılmış arzuları kabul edilebilir biçime dönüştürür.",
];

// ─── Ana fonksiyon ───────────────────────────────────────────────────────────

/**
 * Markdown içeriğe deterministik mikro-varyasyonlar ekler.
 *
 * @param markdown  Orijinal markdown içerik
 * @param slug      Rüyanın slug değeri (seed olarak kullanılır)
 * @returns         Mikro-varyasyon eklenmiş markdown
 */
export function injectMicroVariation(
  markdown: string,
  slug: string
): string {
  const h = seedHash(slug);

  const paragraphs = markdown.split(/\n{2,}/);

  // En az 5 paragraf yoksa enjeksiyona gerek yok
  if (paragraphs.length < 5) return markdown;

  // 2 enjeksiyon noktası seç — ilk 2 paragrafı atla, başlık/ayraç atla
  const candidates: number[] = [];
  for (let i = 2; i < paragraphs.length; i++) {
    const trimmed = paragraphs[i].trim();
    if (
      trimmed === "---" ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("**İçindekiler**") ||
      trimmed.startsWith("- [")
    ) continue;
    // İçerik paragrafı
    if (trimmed.length > 80) {
      candidates.push(i);
    }
  }

  if (candidates.length < 2) return markdown;

  // İki farklı enjeksiyon noktası seç
  const idx1 = candidates[h % candidates.length];
  let idx2 = candidates[(h + 7) % candidates.length];
  if (idx2 === idx1 && candidates.length > 1) {
    idx2 = candidates[(h + 13) % candidates.length];
  }
  // Hala aynıysa sadece 1 enjeksiyon yap
  const points = idx1 === idx2 ? [idx1] : [Math.min(idx1, idx2), Math.max(idx1, idx2)];

  // Cümleler seç
  const clause1 = MICRO_CLAUSES[h % MICRO_CLAUSES.length];
  const clause2 = MICRO_CLAUSES[(h + 11) % MICRO_CLAUSES.length];
  const clauses = [clause1, clause2];

  // İtalik olarak paragraf sonuna ekle
  const result = [...paragraphs];
  for (let j = 0; j < points.length; j++) {
    const pi = points[j];
    result[pi] = result[pi] + `\n\n*${clauses[j]}*`;
  }

  return result.join("\n\n");
}

export default injectMicroVariation;
