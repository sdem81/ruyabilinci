/**
 * Fix AdSense Violations Script
 * Removes banned terms from 298 dream titles and rephrases them naturally
 * 
 * Banned Terms:
 * dövmek (beat), vurulmak (hit), cinsel (sexual), suğ (blood),
 * kurşun (bullet), terörist (terrorist), dayak (beating), uyuşturucu (drug),
 * taciz (harassment), intihar (suicide)
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "../utils/slugify";
import { enrichWithEntities } from "../lib/semanticBuilder";

const prisma = new PrismaClient();
const BATCH_SIZE = 50;

const BANNED_TERMS = [
  "dövmek",
  "vurulmak",
  "cinsel",
  "suğ",
  "kurşun",
  "terörist",
  "dayak",
  "uyuşturucu",
  "taciz",
  "intihar",
];

function hasBannedTerms(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_TERMS.some((term) => lowerText.includes(term));
}

function removeBannedTerms(text: string): string {
  let result = text;

  // Remove each banned term with word boundaries
  BANNED_TERMS.forEach((term) => {
    // Match the exact term between word boundaries
    const regex = new RegExp(`\\b${term}\\b`, "gi");

    // Replace the term with a safe alternative based on context
    result = result.replace(regex, "");
  });

  // Clean up multiple spaces and trim
  result = result
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*[,;]?\s*$/g, ""); // Remove trailing punctuation

  return result;
}

function smartRephrash(dirtyTitle: string): string {
  const lowerDirty = dirtyTitle.toLowerCase();

  // Identify what action/entity is being discussed
  const actionPhrases: { [key: string]: string } = {
    dövmek: "karşılaşmak",
    vurulmak: "çarpılmak",
    cinsel: "kişisel",
    suğ: "kan",
    kurşun: "mermi",
    terörist: "tehlikeli",
    dayak: "darbe",
    uyuşturucu: "kimyasal",
    taciz: "rahatsız",
    intihar: "ölüm",
  };

  let improved = dirtyTitle;

  // Replace dangerous terms with safer synonyms
  Object.entries(actionPhrases).forEach(([dangerous, safe]) => {
    const regex = new RegExp(`\\b${dangerous}\\b`, "gi");
    improved = improved.replace(regex, safe);
  });

  // Only if that doesn't work, use semantic fallback
  if (!hasBannedTerms(improved)) {
    return improved;
  }

  // Fallback to removal
  return removeBannedTerms(dirtyTitle);
}

async function generateRephrasing(title: string, content: string): Promise<string> {
  // First try smart rephrasing (synonym replacement)
  let improved = smartRephrash(title);

  if (!hasBannedTerms(improved) && improved.length > 5) {
    return improved;
  }

  // If that still has banned terms, try removal
  let cleaned = removeBannedTerms(title);
  if (!hasBannedTerms(cleaned) && cleaned.length > 5) {
    const capitalized = cleaned
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    return capitalized;
  }

  // Last resort: semantic fallback
  try {
    const entities = enrichWithEntities(title);
    const primary = entities.primaryEntity || "rüya";

    const safeTemplates = [
      `Rüyada ${primary} tabirleri`,
      `Rüyada ${primary} anlamı`,
      `Rüyada ${primary} görmek`,
      `Rüyada ${primary} deneyimi`,
    ];

    for (const template of safeTemplates) {
      if (!hasBannedTerms(template)) {
        return template;
      }
    }
  } catch (e) {
    // Semantic analysis failed
  }

  return "Rüya Tabirleri";
}

function replaceAll(str: string, search: string, replace: string): string {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return str.replace(regex, replace);
}

async function generateUniqueSlug(
  baseSlug: string,
  currentId: number
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.dream.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

async function fixAdsenseViolations() {
  console.log("🔍 Starting AdSense Violations Fix...\n");

  try {
    // Find all records with banned terms
    const allDreams = await prisma.dream.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        shortSummary: true,
        metaDescription: true,
        slug: true,
      },
      orderBy: { id: "asc" },
    });

    const violations = allDreams.filter((d) => hasBannedTerms(d.title));

    console.log(
      `📊 Found ${violations.length} records with banned AdSense terms\n`
    );
    console.log(`Banned terms: ${BANNED_TERMS.join(", ")}\n`);
    console.log(`⚙️ Processing in batches of ${BATCH_SIZE}...\n`);

    let processedCount = 0;
    let totalFixed = 0;
    let totalSkipped = 0;
    const startTime = Date.now();

    for (let i = 0; i < violations.length; i += BATCH_SIZE) {
      const batch = violations.slice(i, i + BATCH_SIZE);

      let batchFixed = 0;
      let batchSkipped = 0;
      let exampleOldTitle = "";
      let exampleNewTitle = "";

      for (const record of batch) {
        if (!hasBannedTerms(record.title)) continue;

        const oldTitle = record.title;

        try {
          // Generate rephrased title
          const newTitle = await generateRephrasing(
            oldTitle,
            record.content
          );

          // Verify it doesn't have banned terms
          if (hasBannedTerms(newTitle)) {
            console.error(`   ⚠️ Rephrase failed for ID ${record.id} - new title still has banned terms`);
            batchSkipped++;
            totalSkipped++;
            continue;
          }

          const newSlug = await generateUniqueSlug(slugify(newTitle), record.id);

          // Update content/excerpt/meta
          let newContent = record.content;
          if (newContent.includes(oldTitle)) {
            newContent = replaceAll(newContent, oldTitle, newTitle);
          }

          let newShortSummary = record.shortSummary;
          if (newShortSummary && newShortSummary.includes(oldTitle)) {
            newShortSummary = replaceAll(
              newShortSummary,
              oldTitle,
              newTitle
            );
          }

          let newMetaDescription = record.metaDescription;
          if (
            newMetaDescription &&
            newMetaDescription.includes(oldTitle)
          ) {
            newMetaDescription = replaceAll(
              newMetaDescription,
              oldTitle,
              newTitle
            );
          }

          // Update database
          await prisma.dream.update({
            where: { id: record.id },
            data: {
              title: newTitle,
              slug: newSlug,
              content: newContent,
              shortSummary: newShortSummary || undefined,
              metaDescription: newMetaDescription || undefined,
              contentHash: null,
            },
          });

          batchFixed++;
          totalFixed++;

          if (!exampleOldTitle) {
            exampleOldTitle = oldTitle;
            exampleNewTitle = newTitle;
          }
        } catch (error: any) {
          batchSkipped++;
          totalSkipped++;
          console.error(
            `   ⚠️ Failed ID ${record.id}: ${error.message || "error"}`
          );
        }
      }

      processedCount += batch.length;

      console.log(
        `📝 Processed: ${processedCount}/${violations.length} records`
      );
      console.log(
        `   Fixed: ${batchFixed} records | Skipped: ${batchSkipped}`
      );

      if (exampleOldTitle) {
        console.log(`   Example:`);
        console.log(`      ❌ "${exampleOldTitle}"`);
        console.log(`      ✅ "${exampleNewTitle}"`);
        console.log();
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n✅ AdSense Violations Fix Complete!\n");
    console.log("📈 Summary:");
    console.log(`   Total Violations Found: ${violations.length}`);
    console.log(`   Successfully Fixed: ${totalFixed}`);
    console.log(`   Skipped (Errors): ${totalSkipped}`);
    console.log(`   Processing Time: ${duration}s`);
    console.log(
      `   Speed: ${(totalFixed / parseFloat(duration)).toFixed(1)} records/sec\n`
    );
  } catch (error) {
    console.error("❌ Error during violation fix:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdsenseViolations();
