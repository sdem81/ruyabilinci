import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BATCH_SIZE = 500;

function findPrefixMarkerIndex(content: string): number {
  const lower = content.toLowerCase();
  const markers = [" rüyası,", " temasının", " teması,"];

  let minIndex = -1;
  for (const marker of markers) {
    const idx = lower.indexOf(marker);
    if (idx > 0 && idx <= 320 && (minIndex === -1 || idx < minIndex)) {
      minIndex = idx;
    }
  }

  return minIndex;
}

function normalizeSemicolonArtifacts(text: string | null, title: string): string | null {
  if (!text) return text;

  let output = text;

  const markerIndex = findPrefixMarkerIndex(output);
  if (markerIndex > 0) {
    const prefix = output.slice(0, markerIndex);
    const suffix = output.slice(markerIndex);

    if (prefix.includes(";")) {
      const titleWithoutPrefix = title.replace(/^Rüyada\s+/i, "").trim();
      const replacementPrefix =
        prefix.trim().toLowerCase().startsWith("rüyada")
          ? `Rüyada ${titleWithoutPrefix}`
          : title;

      output = `${replacementPrefix}${suffix}`;
    }
  }

  output = output
    .replace(/^\s*["“”']+\s*/u, "")
    .replace(/\s*["“”']+\s*(rüyası,|temasının|teması,)/giu, " $1")
    .replace(/\s*;{2,}\s*/g, " ")
    .replace(/\s*;\s*(Rüyada\s+)/gi, ". $1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return output;
}

async function cleanSemicolonArtifacts() {
  console.log("🔍 Scanning semicolon artifacts in content fields...\n");

  try {
    const dirtyIds = (
      await prisma.dream.findMany({
        where: {
          OR: [
            { content: { contains: ";;;;" } },
            { shortSummary: { contains: ";;;;" } },
            { metaDescription: { contains: ";;;;" } },
          ],
        },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    ).map((item) => item.id);

    console.log(`📊 Found ${dirtyIds.length} records with semicolon artifacts`);
    console.log(`⚙️ Processing in ${BATCH_SIZE} record batches...\n`);

    let totalProcessed = 0;
    let totalUpdated = 0;
    const start = Date.now();

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
        },
        orderBy: { id: "asc" },
      });

      let updatedInBatch = 0;
      let sampleBefore = "";
      let sampleAfter = "";

      for (const record of batch) {
        const cleanedContent = normalizeSemicolonArtifacts(record.content, record.title);
        const cleanedSummary = normalizeSemicolonArtifacts(
          record.shortSummary,
          record.title
        );
        const cleanedMeta = normalizeSemicolonArtifacts(
          record.metaDescription,
          record.title
        );

        const isChanged =
          cleanedContent !== record.content ||
          cleanedSummary !== record.shortSummary ||
          cleanedMeta !== record.metaDescription;

        if (!isChanged) continue;

        await prisma.dream.update({
          where: { id: record.id },
          data: {
            content: cleanedContent ?? record.content,
            shortSummary: cleanedSummary ?? undefined,
            metaDescription: cleanedMeta ?? undefined,
            contentHash: null,
          },
        });

        updatedInBatch++;

        if (!sampleBefore) {
          sampleBefore = record.content.slice(0, 160).replace(/\n/g, " ");
          sampleAfter = (cleanedContent ?? "").slice(0, 160).replace(/\n/g, " ");
        }
      }

      totalProcessed += batch.length;
      totalUpdated += updatedInBatch;

      console.log(`📝 Processed: ${totalProcessed}/${dirtyIds.length}`);
      console.log(`   Updated: ${updatedInBatch}`);

      if (sampleBefore) {
        console.log(`   Example before: ${sampleBefore}`);
        console.log(`   Example after : ${sampleAfter}`);
      }

      console.log();
    }

    const seconds = ((Date.now() - start) / 1000).toFixed(2);
    console.log("✅ Semicolon artifact cleanup completed\n");
    console.log(`   Total scanned : ${dirtyIds.length}`);
    console.log(`   Total updated : ${totalUpdated}`);
    console.log(`   Duration      : ${seconds}s`);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSemicolonArtifacts();
