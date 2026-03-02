/**
 * generate-all-content.ts
 * 45k rüya içerik motorunu çalıştırır.
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { classifyDreamTitle, type DreamType } from "../lib/dreamClassifier";
import { getBlock, type Section } from "../lib/contentBlocks";
import { generateIntro } from "../lib/generators/introGenerator";
import { enrichWithEntities } from "../lib/semanticBuilder";
import { hashContent } from "../lib/contentHash";

const prisma = new PrismaClient();

// ─── CLI argümanları ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const ONLY_EMPTY   = args.includes("--only-empty");
const ONLY_MISSING = args.includes("--only-missing");
const DRY_RUN      = args.includes("--dry-run");
const LIMIT_ARG    = args.find((a) => a.startsWith("--limit="));
const BATCH_ARG    = args.find((a) => a.startsWith("--batch=") || a.startsWith("--batch-size="));
const SLUG_ARG     = args.find((a) => a.startsWith("--only-slug="));

const LIMIT_N      = LIMIT_ARG  ? parseInt(LIMIT_ARG.split("=")[1],  10) : Infinity;
const BATCH_SIZE   = BATCH_ARG  ? parseInt(BATCH_ARG.split("=")[1], 10) : 500;
const ONLY_SLUG    = SLUG_ARG   ? SLUG_ARG.split("=")[1] : null;

// DB yazma eşzamanlılık limiti — Prisma bağlantı havuzunu korur
const CONCURRENCY_ARG = args.find((a) => a.startsWith("--concurrency="));
const WRITE_CONCURRENCY = CONCURRENCY_ARG
  ? parseInt(CONCURRENCY_ARG.split("=")[1], 10)
  : 20;

// ─── Bölüm başlıkları (H2) ────────────────────────────────────────────────────
const H2_LABELS: Record<Section, string[]> = {
  positive: [
    "Olumlu Yorumlar ve Müjdeler",
    "Pozitif Anlamlar",
    "İyiye Yorulan İşaretler",
    "Olumlu Enerjiler",
    "Hayırlı Gelişmeler",
    "İyi Haberlerin Habercisi",
  ],
  negative: [
    "Uyarılar ve Zorlayıcı Yorumlar",
    "Olumsuz veya Endişe Veren İşaretler",
    "Dikkat Gerektiren Durumlar",
    "Gölge Yanlar",
    "Riskler ve Sınavlar",
    "Zorlu Dönemler",
  ],
  psychological: [
    "Psikolojik ve Bilinçdışı Anlam",
    "Zihinsel Yorum",
    "Bilinçaltı Mesajları",
    "Psikodinamik Perspektif",
    "İçsel Dünya Analizi",
    "Ruhsal Yapı ve Arketipler",
  ],
  religious: [
    "Dini / Manevi Yorum",
    "İslami ve Geleneksel Tabir",
    "Manevi Rehberlik",
    "İnanç Perspektifi",
    "İlahi Mesajlar",
    "Ruhani Anlamlar",
  ],
  advice: [
    "Uygulanabilir Öneriler",
    "Pratik Tavsiyeler",
    "Eylem Adımları",
    "Hayata Geçirilecek Noktalar",
    "Yol Haritası",
    "Günlük Yaşama Uyum",
  ],
};

// ─── H2 set üreticisi ─────────────────────────────────────────────────────────
function getH2Set(seed: string) {
  const pick = (section: Section) => {
    const list = H2_LABELS[section];
    const idx = hashStr(`${section}:${seed}`) % list.length;
    return list[idx];
  };

  return {
    positive: pick("positive"),
    negative: pick("negative"),
    psychological: pick("psychological"),
    religious: pick("religious"),
    historical: "Tarihsel ve Kültürel Bağlam",
    advice: pick("advice"),
  };
}

// ─── Giriş paragrafı (type-bazlı) ─────────────────────────────────────────────
function getIntroBlock(type: DreamType, seed: string) {
  const idx = hashStr(`intro:${type}:${seed}`) % 3;
  const prefix = [
    "Rüyanızda karşılaştığınız sembolü anlamlandırırken,",
    "Bu rüya, bilinçaltınızın size gönderdiği bir işaret olarak,",
    "Geleneksel ve modern tabirler ışığında,",
  ][idx];

  const typeNotes: Record<DreamType, string> = {
    family: "aile ve yakın ilişkilerdeki bağları güçlendiren dinamikleri", 
    animal: "içgüdüsel tepkilerinizi ve korunma ihtiyacınızı", 
    object: "maddi dünyayla ilişkinizi ve sahiplenme duygunuzu", 
    action: "harekete geçme motivasyonunuzu ve irade gücünüzü", 
    nature: "doğayla kurduğunuz bağları ve sakinleşme ihtiyacınızı", 
    body: "bedensel farkındalığınızı ve sağlıkla ilgili iç sezgilerinizi", 
    spiritual: "maneviyat arayışınızı ve içsel rehberliğinizi", 
    emotion: "duygusal dengelerinizi ve empati kapasitenizi", 
    mixed: "birden fazla temayı aynı anda tetikleyen karmaşık süreçleri", 
  };

  return `${prefix} ${typeNotes[type]} öne çıkarır. Rüyanın içinde yer alan sembolleri bir bütün olarak değerlendirerek, size özel bir içgörü sunmayı hedefler.`;
}

// ─── Tarihsel blok ───────────────────────────────────────────────────────────
function getHistoricalBlock(type: DreamType, seed: string) {
  const note = [
    "İbn Sirin ve klasik tabir geleneği, sembolü çoğunlukla toplumsal bağlamda ele alır.",
    "Anadolu halk inanışlarında, bu sembol gündelik hayatla manevi alan arasında köprü kurar.",
    "Modern rüya kuramları, sembolü bilinçdışı motivasyonlarla ilişkilendirir.",
  ][hashStr(`hist:${seed}`) % 3];

  const typeAngles: Record<DreamType, string> = {
    family: "Ailevi ritüeller ve kuşaklar arası aktarılan anlamlar burada belirgindir.",
    animal: "Totemik hayvan sembolleri, koruma ve içgüdü temalarını güçlendirir.",
    object: "Eşyalar, mülkiyet ve aidiyet kavramları üzerinden yorumlanır.",
    action: "Hareket motifleri, değişim ve yolculuk hikayeleriyle iç içe geçer.",
    nature: "Doğa unsurları, bereket ve döngüsellik sembolleriyle zenginleşir.",
    body: "Bedene ilişkin semboller, şifa ve arınma ritüelleriyle ilişkilidir.",
    spiritual: "Manevi imgeler, ilahi mesajlar ve sufî öğretilerle harmanlanır.",
    emotion: "Duygusal semboller, toplumun kolektif duygu dünyasını yansıtır.",
    mixed: "Birden çok katman, kültürlerarası etkileşimlerle birleşir.",
  };

  return `${note} ${typeAngles[type]}`;
}

// ─── Filtre yardımcısı ────────────────────────────────────────────────────────
function buildWhereClause(): Prisma.DreamWhereInput | undefined {
  if (ONLY_SLUG) {
    return { slug: ONLY_SLUG };
  }
  if (ONLY_EMPTY || ONLY_MISSING) {
    return { content: { equals: "" } } as Prisma.DreamWhereInput;
  }
  return undefined;
}

// ─── Deterministik hash ───────────────────────────────────────────────────────
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Başlık normalizer (Rüyada duplikasyonunu önler) ─────────────────────────
function normalizeTitle(title: string): string {
  if (/^rüyada\s+/i.test(title)) return title;
  return `Rüyada ${title}`;
}

// ─── Slug'tan güvenli ID üret ────────────────────────────────────────────────
const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function slugify(input: string): string {
  const ascii = input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugToId(s: string): string {
  return slugify(s);
}

// ─── Meta açıklama üretici (150–155 karakter, kelime ortasında kesmez) ───────
function generateMeta(title: string): string {
  const normalized = normalizeTitle(title);
  const h = hashStr(title);

  const templates: Array<(t: string, nt: string) => string> = [
    (t, nt) => `${nt} ne anlama gelir? İslami ve psikolojik yorumuyla ${t} rüyasının derin sembolik anlamları, olumlu ve olumsuz açıklamaları.`,
    (t, nt) => `${nt} görmek: Uzman rüya tabiri, sembolik mesajlar ve bilinçaltı yorumu. ${t} rüyasının kültürel ve manevi katmanları.`,
    (t, nt) => `${t} rüyasının anlamı nedir? İbn Sirin, Jung ve geleneksel yorumla ${nt} görmek — kapsamlı analiz ve pratik tavsiyeler.`,
    (t, nt) => `${t} rüyası: Olumlu ve olumsuz yorumlar, dini açıklama, psikolojik analiz ve gündelik hayata yansımaları hakkında rehber.`,
  ];

  let raw = templates[h % templates.length](title, normalized);

  if (raw.length > 155) {
    raw = raw.slice(0, 155);
    const lastSpace = raw.lastIndexOf(" ");
    if (lastSpace > 120) raw = raw.slice(0, lastSpace);
  }

  return raw;
}

// ─── TOC oluşturucu ───────────────────────────────────────────────────────────
function buildTOC(sections: Array<{ id: string; label: string }>): string {
  const items = sections.map((s) => `- [${s.label}](#${s.id})`).join("\n");
  return `**İçindekiler**\n\n${items}`;
}

// ─── İç Link Enjeksiyonu (devre dışı — artık render zamanında DB'den yapılıyor)
// Token bazlı link oluşturma kaldırıldı; kırık link riski sıfırlandı.
// Bkz: lib/linkInjector.ts — sayfa render zamanında DB-driven link enjeksiyonu.

// ─── Bölüm sıra varyasyonları — yapısal parmak izini kırar ─────────────────────
// Dört farklı sıralama: her rüya başlığının hash'i hangisini seçeceğini belirler.
// Tarihsel bağlam (historical) ve tavsiye (advice) bölümleri her zaman sonda kalır.
type CoreSection = "positive" | "negative" | "psychological" | "religious";

const SECTION_ORDERINGS: CoreSection[][] = [
  ["positive",      "negative",      "psychological", "religious"],   // Sıra 0
  ["psychological", "positive",      "religious",     "negative"],    // Sıra 1
  ["negative",      "religious",     "positive",      "psychological"], // Sıra 2
  ["religious",     "psychological", "negative",      "positive"],     // Sıra 3
];

// ─── Markdown içerik üretici ──────────────────────────────────────────────────
function buildMarkdown(title: string): string {
  const result  = classifyDreamTitle(title);
  const type    = result.type;
  const seed    = title;
  const entities = enrichWithEntities(title, type);

  // Bloklar
  const titleSpecificIntro = generateIntro(title);
  const typeIntro          = getIntroBlock(type, seed);

  // Bölüm içerikleri
  const blocks: Record<CoreSection, ReturnType<typeof getBlock>> = {
    positive:      getBlock("positive",      type, seed, entities),
    negative:      getBlock("negative",      type, seed, entities),
    psychological: getBlock("psychological", type, seed, entities),
    religious:     getBlock("religious",     type, seed, entities),
  };
  const adv  = getBlock("advice", type, seed, entities);
  const hist = getHistoricalBlock(type, seed);
  const h2   = getH2Set(seed);

  // Deterministik bölüm sırası — hash(title) % 4 ile belirlenir
  const orderIdx = hashStr(seed) % SECTION_ORDERINGS.length;
  const sectionOrder = SECTION_ORDERINGS[orderIdx];

  // NOT: İç link enjeksiyonu artık render zamanında yapılıyor (lib/linkInjector.ts)

  // H2 ve ID eşlemesi
  const h2Map: Record<CoreSection, string> = {
    positive:      h2.positive,
    negative:      h2.negative,
    psychological: h2.psychological,
    religious:     h2.religious,
  };

  // TOC — shuffled sırayla
  const tocEntries = sectionOrder.map((sec) => ({
    id:    slugToId(h2Map[sec]),
    label: h2Map[sec],
  }));
  // Sabit sonlar: historical, advice
  tocEntries.push(
    { id: slugToId(h2.historical), label: h2.historical },
    { id: slugToId(h2.advice),     label: h2.advice },
  );
  const toc = buildTOC(tocEntries);

  // İçerik bölümleri — shuffled
  const mainSections = sectionOrder.map((sec) => {
    const b  = blocks[sec];
    const id = slugToId(h2Map[sec]);
    return `## ${h2Map[sec]} {#${id}}\n\n### ${b.heading}\n\n${b.body}`;
  }).join("\n\n---\n\n");

  const advId  = slugToId(h2.advice);
  const histId = slugToId(h2.historical);

  return `${titleSpecificIntro}

${typeIntro}

${toc}

---

${mainSections}

---

## ${h2.historical} {#${histId}}

${hist}

---

## ${h2.advice} {#${advId}}

### ${adv.heading}

${adv.body}
`;
}

// ─── Kelime sayısı tahmini ────────────────────────────────────────────────────
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// ─── Tek rüya işleme ──────────────────────────────────────────────────────────
async function processDream(
  dream: { id: number; title: string; slug: string },
  seenHashes: Set<string>
): Promise<{ ok: boolean; id: number; duplicate?: boolean; error?: string }> {
  try {
    const markdown = buildMarkdown(dream.title);
    const meta     = generateMeta(dream.title);
    const wc       = countWords(markdown);
    const hash     = hashContent(markdown);

    // İn-memory duplikat guard: same content hash → don't publish
    if (seenHashes.has(hash)) {
      if (!DRY_RUN) {
        await prisma.dream.update({
          where: { id: dream.id },
          data: { contentHash: hash, isPublished: false },
        });
      }
      return { ok: true, id: dream.id, duplicate: true };
    }
    seenHashes.add(hash);

    if (!DRY_RUN) {
      await prisma.dream.update({
        where: { id: dream.id },
        data: {
          content:         markdown,
          metaDescription: meta,
          wordCount:       wc,
          contentHash:     hash,
          // Thin content guard: kelime sayısı < 150 ise yayınlama
          ...(wc < 150 ? { isPublished: false } : {}),
        },
      });
    }
    return { ok: true, id: dream.id };
  } catch (err: unknown) {
    return {
      ok: false,
      id: dream.id,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Rüya İçerik Motoru ===");
  console.log(`Mod: ${DRY_RUN ? "DRY-RUN" : "YAZMA"} | Batch: ${BATCH_SIZE} | Concurrency: ${WRITE_CONCURRENCY} | Sadece boş: ${ONLY_EMPTY || ONLY_MISSING} | Limit: ${isFinite(LIMIT_N) ? LIMIT_N : "tümü"}`);

  const totalCount = await prisma.dream.count({
    where: buildWhereClause(),
  });

  const effectiveLimit = Math.min(totalCount, isFinite(LIMIT_N) ? LIMIT_N : totalCount);
  console.log(`Toplam işlenecek: ${effectiveLimit} / ${totalCount} rüya\n`);

  if (DRY_RUN) {
    const samples = await prisma.dream.findMany({
      where: buildWhereClause(),
      select: { id: true, title: true, slug: true },
      take: 5,
    });
    for (const d of samples) {
      console.log(`\n─── ID: ${d.id} | ${d.title} ───`);
      console.log(buildMarkdown(d.title).slice(0, 600) + "\n...");
    }
    await prisma.$disconnect();
    return;
  }

  let cursor: number | undefined = undefined;
  let processed = 0;
  let errors    = 0;
  let duplicates = 0;
  const startTime = Date.now();
  const seenHashes = new Set<string>(); // in-memory content-hash dedup guard

  while (processed < effectiveLimit) {
    const batchSize = Math.min(BATCH_SIZE, effectiveLimit - processed);

    const batch: { id: number; title: string; slug: string }[] = await prisma.dream.findMany({
      where: buildWhereClause(),
      select: { id: true, title: true, slug: true },
      take: batchSize,
      skip: cursor !== undefined ? 1 : 0,
      ...(cursor !== undefined ? { cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
    });

    if (batch.length === 0) break;

    // Eşzamanlılık sınırlı yazma — Prisma bağlantı havuzunu aşmaz
    const results: Awaited<ReturnType<typeof processDream>>[] = [];
    for (let ci = 0; ci < batch.length; ci += WRITE_CONCURRENCY) {
      const chunk = batch.slice(ci, ci + WRITE_CONCURRENCY);
      const chunkResults = await Promise.all(chunk.map((d) => processDream(d, seenHashes)));
      results.push(...chunkResults);
    }

    for (const r of results) {
      if (!r.ok) {
        errors++;
        console.error(`  ✗ ID ${r.id}: ${r.error}`);
      } else if (r.duplicate) {
        duplicates++;
      }
    }

    processed += batch.length;
    cursor = batch[batch.length - 1].id;

    const elapsed  = ((Date.now() - startTime) / 1000).toFixed(1);
    const rps      = (processed / parseFloat(elapsed)).toFixed(0);
    const pct      = ((processed / effectiveLimit) * 100).toFixed(1);

    process.stdout.write(
      `\r[${pct}%] ${processed}/${effectiveLimit} işlendi | ${errors} hata | ${duplicates} dup | ${rps} rüya/sn | ${elapsed}s`
    );
  }

  const total = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Tamamlandı: ${processed} rüya, ${errors} hata, ${duplicates} duplikat gizlendi, ${total}s`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
