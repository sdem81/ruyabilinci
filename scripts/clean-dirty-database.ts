/**
 * Clean Dirty Database Script - Removes semicolons and duplicate title patterns
 * Processes 45,000+ dream records in 500-item batches to avoid RAM overflow
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "../utils/slugify";

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function replaceAll(str: string, search: string, replace: string): string {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
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

function extractCleanTitle(dirtyTitle: string): string {
  const cleanPart = dirtyTitle.split(";")[0].trim();
  return toTitleCase(cleanPart);
}

async function cleanDirtyDatabase() {
  console.log("🔍 Starting Dirty Database Cleanup Process...\n");

  try {
    const totalDirtyCount = await prisma.dream.count({
      where: { title: { contains: ";" } },
    });

    console.log(
      `📊 Found ${totalDirtyCount} records with semicolons in title\n`
    );
    console.log(`⚙️ Processing in batches of ${BATCH_SIZE}...\n`);

    let processedCount = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const startTime = Date.now();

    // Fetch ALL dirty record IDs upfront to avoid cursor drifting
    const dirtyIds = (
      await prisma.dream.findMany({
        where: { title: { contains: ";" } },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    ).map((r) => r.id);

    // Process in batches by ID
    for (let i = 0; i < dirtyIds.length; i += BATCH_SIZE) {
      const batchIds = dirtyIds.slice(i, i + BATCH_SIZE);
      const batch = await prisma.dream.findMany({
        where: { id: { in: batchIds } },
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

      if (batch.length === 0) continue;

      // Process each record
      let batchUpdated = 0;
      let batchSkipped = 0;
      let exampleTitle = "";
      let exampleNewTitle = "";

      for (const record of batch) {
        if (!record.title.includes(";")) continue;

        const oldTitle = record.title;
        const newTitle = extractCleanTitle(oldTitle);
        const baseSlug = slugify(newTitle);

        try {
          const newSlug = await generateUniqueSlug(baseSlug, record.id);

          let newContent = record.content;
          if (newContent.includes(oldTitle)) {
            newContent = replaceAll(newContent, oldTitle, newTitle);
          }

          let newShortSummary = record.shortSummary;
          if (newShortSummary && newShortSummary.includes(oldTitle)) {
            newShortSummary = replaceAll(newShortSummary, oldTitle, newTitle);
          }

          let newMetaDescription = record.metaDescription;
          if (newMetaDescription && newMetaDescription.includes(oldTitle)) {
            newMetaDescription = replaceAll(
              newMetaDescription,
              oldTitle,
              newTitle
            );
          }

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

          batchUpdated++;

          if (!exampleTitle) {
            exampleTitle = oldTitle;
            exampleNewTitle = newTitle;
          }
        } catch (error: any) {
          batchSkipped++;
          console.error(
            `   ⚠️ Skipped ID ${record.id}: ${error.message || "error"}`
          );
        }
      }

      processedCount += batch.length;
      totalUpdated += batchUpdated;
      totalSkipped += batchSkipped;

      console.log(
        `📝 Processed: ${processedCount}/${totalDirtyCount} records`
      );
      console.log(
        `   Updated: ${batchUpdated} records | Skipped: ${batchSkipped}`
      );

      if (exampleTitle) {
        console.log(`   Example: "${exampleTitle}"`);
        console.log(`        ↓`);
        console.log(`           "${exampleNewTitle}"`);
        console.log();
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n✅ Cleanup Complete!\n");
    console.log("📈 Summary:");
    console.log(`   Total Dirty Records Found: ${totalDirtyCount}`);
    console.log(`   Successfully Updated: ${totalUpdated}`);
    console.log(`   Skipped (Errors): ${totalSkipped}`);
    console.log(`   Processing Time: ${duration}s`);
    console.log(
      `   Speed: ${(totalUpdated / parseFloat(duration)).toFixed(1)} records/sec\n`
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDirtyDatabase();
