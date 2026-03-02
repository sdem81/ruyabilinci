/**
 * Aggressive AdSense Violations Fixer
 * Directly replaces/removes all banned terms from database
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "../utils/slugify";

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

/**
 * Replace banned terms with safe alternatives
 */
const REPLACEMENTS: { [key: string]: string } = {
  dövmek: "çatışmak",
  vurulmak: "çarpılmak",
  cinsel: "kişisel",
  suğ: "kan",
  kurşun: "mermi",
  terörist: "tehlikeli kişi",
  dayak: "saldırı",
  uyuşturucu: "madde",
  taciz: "rahatsızlık",
  intihar: "ölüm",
};

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

function replaceAll(str: string, search: string, replace: string): string {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return str.replace(regex, replace);
}

function cleanTitle(title: string): string {
  let result = title;

  // Apply replacements in order
  Object.entries(REPLACEMENTS).forEach(([banned, safe]) => {
    result = replaceAll(result, banned, safe);
  });

  // Capitalize correctly
  result = result
    .split(" ")
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // Remove any double spaces
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

function hasBannedTerm(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_TERMS.some((term) => lower.includes(term));
}

async function fixAllViolations() {
  console.log("🔧 Aggressive AdSense Violations Cleanup\n");

  try {
    // Find all records - no filter, we'll check each one
    const allRecords = await prisma.dream.findMany({
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

    const violations = allRecords.filter((r) => hasBannedTerm(r.title));

    console.log(`📊 Found ${violations.length} violations\n`);
    console.log(`⚙️ Processing in batches of ${BATCH_SIZE}...\n`);

    let totalFixed = 0;
    let totalErrors = 0;
    const startTime = Date.now();

    for (let i = 0; i < violations.length; i += BATCH_SIZE) {
      const batch = violations.slice(i, i + BATCH_SIZE);
      let batchFixed = 0;
      let batchErrors = 0;

      for (const record of batch) {
        try {
          const oldTitle = record.title;
          const newTitle = cleanTitle(oldTitle);

          // Skip if still has banned terms (shouldn't happen with cleanTitle)
          if (hasBannedTerm(newTitle)) {
            batchErrors++;
            console.error(
              `   ⚠️ ID ${record.id}: Title still has banned terms after cleaning`
            );
            continue;
          }

          const newSlug = await generateUniqueSlug(slugify(newTitle), record.id);

          // Clean content/excerpt/meta
          let newContent = record.content;
          Object.entries(REPLACEMENTS).forEach(([banned, safe]) => {
            newContent = replaceAll(newContent, banned, safe);
          });

          let newShortSummary = record.shortSummary;
          if (newShortSummary) {
            Object.entries(REPLACEMENTS).forEach(([banned, safe]) => {
              newShortSummary = replaceAll(newShortSummary, banned, safe);
            });
          }

          let newMetaDescription = record.metaDescription;
          if (newMetaDescription) {
            Object.entries(REPLACEMENTS).forEach(([banned, safe]) => {
              newMetaDescription = replaceAll(
                newMetaDescription,
                banned,
                safe
              );
            });
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

          if (batchFixed === 1) {
            console.log(`   Example:`);
            console.log(`      ❌ ${oldTitle}`);
            console.log(`      ✅ ${newTitle}\n`);
          }
        } catch (error: any) {
          batchErrors++;
          totalErrors++;
          console.error(
            `   ⚠️ Error fixing ID ${record.id}: ${error.message}`
          );
        }
      }

      console.log(
        `✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Fixed ${batchFixed}, Errors ${batchErrors}`
      );
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Complete!\n`);
    console.log(`📈 Results:`);
    console.log(`   Total Violations: ${violations.length}`);
    console.log(`   Fixed: ${totalFixed}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Time: ${duration}s`);
    console.log(`   Speed: ${(totalFixed / parseFloat(duration)).toFixed(1)} records/sec\n`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllViolations();
