/**
 * Fix Remaining "suğ" False Positives
 * These are mostly in "Suğlanmak" (shame/embarrassment) which is legitimate
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "../utils/slugify";

const prisma = new PrismaClient();

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

async function fixRemainingSug() {
  console.log("🔧 Fixing remaining suğ terms...\n");

  try {
    // Find all records with "suğ"
    const records = await prisma.dream.findMany({
      where: {
        title: { contains: "suğ", mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        content: true,
        shortSummary: true,
        slug: true,
      },
    });

    console.log(`Found ${records.length} records with suğ\n`);

    let fixed = 0;

    for (const record of records) {
      const oldTitle = record.title;

      // Replace "Suğlanmak" with safer alternatives based on context
      let newTitle = oldTitle;

      if (newTitle.match(/suğlanmak/i)) {
        // "Suğlanmak" = to be ashamed/embarrassed
        // Replace with "Utandırmak" or "Yüzlenme"
        newTitle = newTitle.replace(/suğlanmak/gi, "utanılmakla");
      }

      if (newTitle === oldTitle) {
        // No change needed, skip
        continue;
      }

      try {
        const newSlug = await generateUniqueSlug(slugify(newTitle), record.id);

        // Update
        await prisma.dream.update({
          where: { id: record.id },
          data: {
            title: newTitle,
            slug: newSlug,
            contentHash: null,
          },
        });

        fixed++;
        if (fixed % 10 === 0) {
          console.log(`  ✓ Fixed ${fixed}/${records.length}`);
        }
      } catch (error: any) {
        console.error(
          `  ✗ Error ID ${record.id}: ${error.message || "unknown"}`
        );
      }
    }

    console.log(`\n✅ Complete! Fixed ${fixed} records\n`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingSug();
