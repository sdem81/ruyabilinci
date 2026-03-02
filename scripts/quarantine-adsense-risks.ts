import { PrismaClient } from "@prisma/client";

/**
 * Quarantine Script for AdSense Policy Violations
 * 
 * Purpose: Find and quarantine (unpublish) dream records that contain
 * AdSense-prohibited keywords (violence, sexual, drugs, terrorism, etc.)
 * 
 * Approach: Set isPublished = false instead of deleting (safer for recovery)
 * 
 * Keywords Scanned:
 * - dövmek (beating), vurulmak (hitting), kurşun (bullet), dayak (beating)
 * - cinsel (sexual content)
 * - suç (crime), terörist (terrorism), uyuşturucu (drugs)
 * - taciz (harassment), intihar (suicide)
 */

const prisma = new PrismaClient();

// AdSense-prohibited keywords (Turkish)
const BANNED_KEYWORDS = [
  "dövmek",
  "vurulmak",
  "kurşun",
  "dayak",
  "cinsel",
  "suç",
  "terörist",
  "uyuşturucu",
  "taciz",
  "intihar",
];

interface QuarantineStats {
  totalScanned: number;
  quarantined: number;
  alreadyUnpublished: number;
  byKeyword: Map<string, number>;
  quarantinedItems: Array<{
    id: number;
    title: string;
    reason: string;
  }>;
  timestamp: Date;
}

/**
 * Check if text contains any banned keywords (case-insensitive)
 */
function containsBannedKeyword(text: string): string | null {
  const lowerText = text.toLowerCase();
  for (const keyword of BANNED_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

/**
 * Format report with nice styling
 */
function printQuarantineReport(stats: QuarantineStats): void {
  console.log("\n");
  console.log("═".repeat(80));
  console.log("  🚫 ADSENSE RISK QUARANTINE REPORT");
  console.log("═".repeat(80));
  console.log("\n");

  // ========== Summary ==========
  console.log("┌─ 📊 QUARANTINE SUMMARY");
  console.log(`├─ Total Items Scanned: ${stats.totalScanned.toLocaleString()}`);
  console.log(
    `├─ Items Quarantined (isPublished = false): ${stats.quarantined}`
  );
  console.log(`├─ Already Unpublished: ${stats.alreadyUnpublished}`);
  console.log(`├─ New Items Quarantined: ${stats.quarantined - stats.alreadyUnpublished}`);
  console.log(`└─ Timestamp: ${stats.timestamp.toISOString()}`);
  console.log("\n");

  // ========== By Keyword ==========
  if (stats.byKeyword.size > 0) {
    console.log("┌─ 🏷️  VIOLATIONS BY KEYWORD");
    const sortedKeywords = Array.from(stats.byKeyword.entries())
      .sort((a, b) => b[1] - a[1]);

    sortedKeywords.forEach(([keyword, count], idx) => {
      const isLast = idx === sortedKeywords.length - 1;
      const prefix = isLast ? "└─" : "├─";
      console.log(`${prefix} "${keyword}": ${count} items`);
    });
    console.log("\n");
  }

  // ========== Sample Quarantined Items ==========
  if (stats.quarantinedItems.length > 0) {
    console.log("┌─ 📋 SAMPLE QUARANTINED ITEMS (First 10)");
    stats.quarantinedItems.slice(0, 10).forEach((item, idx) => {
      const isLast = idx === Math.min(9, stats.quarantinedItems.length - 1);
      const prefix = isLast ? "└─" : "├─";
      console.log(
        `${prefix} [ID: ${item.id}] "${item.title}" (${item.reason})`
      );
    });
    console.log("\n");
  }

  // ========== Status & Next Steps ==========
  console.log("┌─ ✅ QUARANTINE STATUS");
  console.log(`├─ All flagged items now have isPublished = false`);
  console.log(`├─ These items are hidden from public view & Google indexing`);
  console.log(`├─ AdSense safety: ${stats.quarantined === 0 ? "✅ ALL CLEAR" : "🟡 " + stats.quarantined + " items hidden"}`);
  console.log(`│`);
  console.log(`├─ NEXT STEPS:`);
  console.log(`│  1. 📋 Review quarantined items in admin panel (/admin/dreams)`);
  console.log(`│  2. ✏️  Edit titles/content to be AdSense-compliant`);
  console.log(`│  3. ☑️  Set isPublished = true to republish`);
  console.log(`│  4. 🔍 Rerun: npm run analyze-quality (to verify 0 violations)`);
  console.log(`│  5. ✅ Apply for AdSense when analysis shows green`);
  console.log(`│`);
  console.log(`└─ Recovery: Quarantined items can be unpublished via admin panel anytime`);
  console.log("\n");
  console.log("═".repeat(80));
}

/**
 * Main quarantine function
 */
async function quarantineAdSenseRisks(): Promise<void> {
  const stats: QuarantineStats = {
    totalScanned: 0,
    quarantined: 0,
    alreadyUnpublished: 0,
    byKeyword: new Map(),
    quarantinedItems: [],
    timestamp: new Date(),
  };

  try {
    console.log("🚀 Starting AdSense risk quarantine...\n");

    // Get all dreams
    const allDreams = await prisma.dream.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        isPublished: true,
      },
    });

    stats.totalScanned = allDreams.length;
    console.log(`📦 Scanning ${stats.totalScanned.toLocaleString()} items...\n`);

    // Identify items with banned keywords
    const idsToQuarantine: number[] = [];
    const keywordMatches = new Map<number, string>();

    for (const dream of allDreams) {
      // Check title and content for banned keywords
      const titleMatch = containsBannedKeyword(dream.title);
      const contentMatch = containsBannedKeyword(dream.content);
      const matchedKeyword = titleMatch || contentMatch;

      if (matchedKeyword) {
        idsToQuarantine.push(dream.id);
        keywordMatches.set(dream.id, matchedKeyword);

        // Track by keyword
        const count = stats.byKeyword.get(matchedKeyword) || 0;
        stats.byKeyword.set(matchedKeyword, count + 1);

        // Store for reporting
        stats.quarantinedItems.push({
          id: dream.id,
          title: dream.title,
          reason: matchedKeyword,
        });

        // Check if already unpublished
        if (!dream.isPublished) {
          stats.alreadyUnpublished++;
        }
      }
    }

    // Quarantine (unpublish) the flagged items
    if (idsToQuarantine.length > 0) {
      console.log(
        `⚠️  Found ${idsToQuarantine.length} items with banned keywords`
      );
      console.log(`🔄 Setting isPublished = false...\n`);

      const updated = await prisma.dream.updateMany({
        where: {
          id: {
            in: idsToQuarantine,
          },
        },
        data: {
          isPublished: false,
        },
      });

      stats.quarantined = updated.count;
      console.log(`✅ Successfully quarantined ${updated.count} items\n`);
    } else {
      console.log(`✅ No items with banned keywords found!\n`);
      stats.quarantined = 0;
    }

    // Print report
    printQuarantineReport(stats);

    // Print summary for clarity
    const newlyQuarantined = stats.quarantined - stats.alreadyUnpublished;
    if (newlyQuarantined > 0) {
      console.log(
        `\n💾 ${newlyQuarantined} adet tehlikeli içerik AdSense güvenliği için karantinaya alındı.\n`
      );
    } else if (stats.quarantined > 0) {
      console.log(
        `\n💾 ${stats.quarantined} adet tehlikeli içerik zaten karantinada idi.\n`
      );
    } else {
      console.log(`\n✅ Hiç tehlikeli içerik bulunamadı - AdSense güvenliği sağlandı!\n`);
    }
  } catch (error) {
    console.error("❌ Error during quarantine:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// RUN QUARANTINE
// ============================================

quarantineAdSenseRisks();
