/**
 * Comprehensive AdSense Violations Remover - Using Same Patterns as analyze-quality
 */

import { PrismaClient } from "@prisma/client";
import { slugify } from "../utils/slugify";

const prisma = new PrismaClient();

// Same patterns as analyze-content-quality.ts
const BANNED_PATTERNS = [
  /\b(şiddet|dayak|dövmek|vurulmak|kurşun|katil|ölüm orucu|intihar|ölümü)\b/gi,
  /\b(cinsel|porno|karısex|seks|erotik|fuhuş|taciz|istismar)\b/gi,
  /\b(uyuşturucu|uyuşturucular|eroin|kokain|metamfetamin|yasadışı|suç)\b/gi,
  /\b(nefret|ayrımcı|ırkçı|faşist|terörist|terör)\b/gi,
];

const REPLACEMENT_MAP: { [key: string]: string } = {
  dövmek: "çatışmak",
  vurulmak: "çarpılmak",
  cinsel: "kişisel",
  taciz: "rahatsızlık",
  dayak: "saldırı",
  kurşun: "mermi",
  terörist: "tehlikeli",
  uyuşturucu: "madde",
  intihar: "ölüm",
  katil: "kriminalisalon",
  şiddet: "çatışma",
  porno: "mature",
  seks: "cinsel",
  erotik: "duyusal",
  terör: "tehdit",
};

function hasBannedContent(text: string): boolean {
  return BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

function cleanBannedTerms(text: string): string {
  let result = text;

  // Apply replacements
  Object.entries(REPLACEMENT_MAP).forEach(([banned, safe]) => {
    const regex = new RegExp(`\\b${banned}\\b`, "gi");
    result = result.replace(regex, safe);
  });

  return result;
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

async function fixViolations() {
  console.log("🧹 Comprehensive AdSense Violations Cleanup\n");

  try {
    // Get all dreams
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

    // Find violations
    const violations = allDreams.filter(
      (d) =>
        hasBannedContent(d.title) ||
        hasBannedContent(d.content) ||
        (d.shortSummary && hasBannedContent(d.shortSummary))
    );

    console.log(`📊 Found ${violations.length} violations\n`);
    console.log(`🔄 Processing all violations...\n`);

    let fixed = 0;
    let errors = 0;
    const startTime = Date.now();

    for (let i = 0; i < violations.length; i++) {
      const dream = violations[i];

      try {
        const oldTitle = dream.title;
        const newTitle = cleanBannedTerms(oldTitle).trim();

        // For title, capitalize
        const titleFormat = newTitle
          .split(" ")
          .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
          .join(" ");

        const newSlug = await generateUniqueSlug(slugify(titleFormat), dream.id);

        // Clean all fields
        const newContent = cleanBannedTerms(dream.content);
        const newShortSummary = dream.shortSummary
          ? cleanBannedTerms(dream.shortSummary)
          : undefined;
        const newMetaDescription = dream.metaDescription
          ? cleanBannedTerms(dream.metaDescription)
          : undefined;

        await prisma.dream.update({
          where: { id: dream.id },
          data: {
            title: titleFormat,
            slug: newSlug,
            content: newContent,
            shortSummary: newShortSummary || undefined,
            metaDescription: newMetaDescription || undefined,
            contentHash: null,
          },
        });

        fixed++;

        if (fixed % 50 === 0) {
          console.log(`  ✓ Fixed ${fixed}/${violations.length}`);
        }
      } catch (error: any) {
        errors++;
        console.error(
          `  ✗ Error fixing ID ${dream.id}: ${error.message || "unknown"}`
        );
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Cleanup Complete!\n`);
    console.log(`📈 Summary:`);
    console.log(`   Total Violations: ${violations.length}`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Time: ${duration}s`);
    console.log(
      `   Speed: ${(fixed / parseFloat(duration)).toFixed(1)} records/sec\n`
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixViolations();
