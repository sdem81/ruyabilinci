import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

function cleanTeaser(text: string | null, title: string): string | null {
  if (!text) return text;

  let output = text
    .replace(/^\s*["“”']+\s*/u, "")
    .replace(/\s*["“”']+\s*$/u, "")
    .replace(/\s*;{2,}\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (output.includes(";")) {
    output = output.split(";")[0].trim();
  }

  const lowerTitle = title.toLowerCase();
  if (output.toLowerCase().endsWith(lowerTitle)) {
    output = output.slice(0, -title.length).trim();
  }

  if (output.length < 40) {
    output = `${title} ne anlama gelir? Rüyanın olası anlamlarını ve psikolojik yorumunu keşfedin.`;
  }

  if (!/[.!?]$/.test(output)) {
    output = `${output}.`;
  }

  return output;
}

async function cleanTeaserSemicolons() {
  console.log("🔍 Scanning shortSummary/metaDescription semicolon artifacts...\n");

  try {
    const dirtyIds = (
      await prisma.dream.findMany({
        where: {
          OR: [
            { shortSummary: { contains: ";" } },
            { metaDescription: { contains: ";" } },
          ],
        },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    ).map((item) => item.id);

    console.log(`📊 Found ${dirtyIds.length} records to clean`);
    console.log(`⚙️ Processing in ${BATCH_SIZE} record batches...\n`);

    let scanned = 0;
    let updated = 0;
    const start = Date.now();

    for (let i = 0; i < dirtyIds.length; i += BATCH_SIZE) {
      const batchIds = dirtyIds.slice(i, i + BATCH_SIZE);
      const batch = await prisma.dream.findMany({
        where: { id: { in: batchIds } },
        select: {
          id: true,
          title: true,
          shortSummary: true,
          metaDescription: true,
        },
        orderBy: { id: "asc" },
      });

      let updatedInBatch = 0;
      let sampleBefore = "";
      let sampleAfter = "";

      for (const record of batch) {
        const cleanedSummary = cleanTeaser(record.shortSummary, record.title);
        const cleanedMeta = cleanTeaser(record.metaDescription, record.title);

        const changed =
          cleanedSummary !== record.shortSummary ||
          cleanedMeta !== record.metaDescription;

        if (!changed) continue;

        await prisma.dream.update({
          where: { id: record.id },
          data: {
            shortSummary: cleanedSummary ?? undefined,
            metaDescription: cleanedMeta ?? undefined,
            contentHash: null,
          },
        });

        updatedInBatch++;
        updated++;

        if (!sampleBefore && record.shortSummary) {
          sampleBefore = record.shortSummary.slice(0, 140).replace(/\n/g, " ");
          sampleAfter = (cleanedSummary ?? "").slice(0, 140).replace(/\n/g, " ");
        }
      }

      scanned += batch.length;
      console.log(`📝 Processed: ${scanned}/${dirtyIds.length} | Updated: ${updatedInBatch}`);
      if (sampleBefore) {
        console.log(`   Example before: ${sampleBefore}`);
        console.log(`   Example after : ${sampleAfter}`);
      }
      console.log();
    }

    const seconds = ((Date.now() - start) / 1000).toFixed(2);
    console.log("✅ Teaser semicolon cleanup completed\n");
    console.log(`   Total scanned : ${dirtyIds.length}`);
    console.log(`   Total updated : ${updated}`);
    console.log(`   Duration      : ${seconds}s`);
  } catch (error) {
    console.error("❌ Teaser cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTeaserSemicolons();
