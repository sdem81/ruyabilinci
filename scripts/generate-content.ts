/**
 * Veritabanındaki tüm rüyaların içeriklerini günceller.
 * 
 * Kullanım:
 *   # Tüm rüyaları güncelle (paralel, hızlı)
 *   npx ts-node --compiler-options {"module":"CommonJS"} ./scripts/generate-content.ts
 * 
 *   # Sadece içeriği boş olanları güncelle
 *   npx ts-node ... --only-empty
 * 
 *   # Sadece belli bir kategorideki rüyaları güncelle
 *   npx ts-node ... --category "Hayvanlar"
 * 
 *   # Belirli sayıda güncelle (test için)
 *   npx ts-node ... --limit 100
 */

import { PrismaClient } from "@prisma/client";
import { generateDreamContent } from "../lib/content-generator";
import { generateContentWithAI } from "../lib/ai-content-generator";

const prisma = new PrismaClient();

// CLI argümanları
const args = process.argv.slice(2);
const onlyEmpty = args.includes("--only-empty");
const useAI = args.includes("--ai");
const limitArg = args.find((a) => a.startsWith("--limit="));
const categoryArg = args.find((a) => a.startsWith("--category="));
const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;
const categoryFilter = categoryArg ? categoryArg.split("=")[1] : undefined;

const BATCH_SIZE = 50; // Aynı anda işlenecek rüya sayısı
const DELAY_MS = 10;   // Batch'ler arası bekleme (ms) - DB baskısını azaltır

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const where: any = {};

  if (onlyEmpty) {
    where.OR = [
      { content: null },
      { content: "" },
    ];
  }

  if (categoryFilter) {
    const cat = await prisma.category.findFirst({
      where: { name: { contains: categoryFilter, mode: "insensitive" } },
    });
    if (!cat) {
      console.error(`Kategori bulunamadı: ${categoryFilter}`);
      process.exit(1);
    }
    where.categoryId = cat.id;
  }

  const total = await prisma.dream.count({ where });
  const toProcess = limit ? Math.min(limit, total) : total;

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌙 Rüya İçerik Üreticisi`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Toplam rüya   : ${total}`);
  console.log(`✏️  Güncellenecek : ${toProcess}`);
  if (useAI) console.log(`🤖 Motor          : OpenAI GPT-4o-mini`);
  else console.log(`⚡ Motor          : Template sistemi`);
  if (onlyEmpty) console.log(`🔍 Mod           : Sadece boş içerikler`);
  if (categoryFilter) console.log(`📂 Kategori      : ${categoryFilter}`);
  if (limit) console.log(`🔢 Limit         : ${limit}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  let processed = 0;
  let success = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let skip = 0; skip < toProcess; skip += BATCH_SIZE) {
    const take = Math.min(BATCH_SIZE, toProcess - skip);
    const dreams = await prisma.dream.findMany({
      where,
      select: { id: true, title: true },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    // Her batch'i paralel işle
    await Promise.all(
      dreams.map(async (dream) => {
        try {
          const { markdown, metaDescription } = useAI
            ? await generateContentWithAI(dream.title, true)
            : generateDreamContent(dream.title);

          await prisma.dream.update({
            where: { id: dream.id },
            data: {
              content: markdown,
              shortSummary: metaDescription,
            },
          });

          success++;
        } catch (err: any) {
          failed++;
          console.error(`  ❌ [${dream.id}] ${dream.title}: ${err.message}`);
        } finally {
          processed++;
        }
      })
    );

    // İlerleme çubuğu
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (processed / parseFloat(elapsed)).toFixed(0);
    const pct = Math.round((processed / toProcess) * 100);
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
    process.stdout.write(
      `\r  [${bar}] ${pct}%  ${processed}/${toProcess}  (${rate} rüya/sn, ${elapsed}s)`
    );

    if (DELAY_MS > 0) await sleep(DELAY_MS);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Tamamlandı!`);
  console.log(`  Başarılı  : ${success}`);
  console.log(`  Hatalı    : ${failed}`);
  console.log(`  Süre      : ${totalTime} saniye`);
  console.log(`  Ortalama  : ${(parseFloat(totalTime) / toProcess).toFixed(3)} sn/rüya`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((e) => {
    console.error("\n💥 Kritik hata:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
