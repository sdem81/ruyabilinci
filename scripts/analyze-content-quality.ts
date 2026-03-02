import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

/**
 * Content Quality Analysis Script for AdSense & Google Helpful Content Algorithm
 * 
 * Analyzes 45,460 dream interpretations for:
 * 1. Word count distribution (thin content detection)
 * 2. Content duplication (boilerplate patterns)
 * 3. AdSense-prohibited content (violence, explicit, illegal terms)
 * 
 * Processes in 1000-item batches to avoid RAM overflow.
 * Read-only operation (no database writes).
 */

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION & PATTERNS
// ============================================

/**
 * AdSense Prohibited Terms in Turkish
 * Source: Google AdSense Policies + HCU Guidelines
 */
const BANNED_KEYWORDS = [
  // Violence
  /\b(şiddet|dayak|dövmek|vurulmak|kurşun|katil|ölüm orucu|intihar|ölümü)\b/gi,
  // Sexual/Adult
  /\b(cinsel|porno|karısex|seks|erotik|fuhuş|taciz|istismar)\b/gi,
  // Illegal/Drugs
  /\b(uyuşturucu|uyuşturucular|eroin|kokain|metamfetamin|yasadışı|suç)\b/gi,
  // Hate speech
  /\b(nefret|ayrımcı|ırkçı|faşist|terörist|terör)\b/gi,
  // Medical fraud
  /\b(dolandırıcı|swindler|sahte ilaç|tıbbi sahtekarlık|kanserden kur)\b/gi,
  // Financial fraud
  /\b(kripto dolanı|para taraması|gümrük|ticari|yapı kooperatifi)\b/gi,
  // Harassment
  /\b(doxxing|yıldırma|istenmeyen|taciz|cyberbullying)\b/gi,
];

/**
 * Common boilerplate opening patterns
 * Used to detect cookie-cutter content
 */
const BOILERPLATE_OPENINGS = [
  "Rüyada görmek",
  "Rüyada gördüğünüz",
  "Rüyada gördüğün",
  "Rüyadaki",
  "Rüyada bu",
  "Bu rüya",
  "Böyle bir rüya",
  "Genellikle rüyada",
  "Rüyada genel anlamda",
];

// ============================================
// TYPES
// ============================================

interface ContentStats {
  totalItems: number;
  wordCount: {
    thinContent: number; // < 300 words
    mediumContent: number; // 300-600 words
    richContent: number; // 600+ words
    averageWords: number;
    minWords: number;
    maxWords: number;
  };
  duplication: {
    totalDuplicates: number; // Items with boilerplate start
    uniqueOpenings: Map<string, number>;
    duplicateGroups: Array<{ opening: string; count: number }>;
  };
  adSenseRisks: {
    itemsWithBannedTerms: number;
    byCategory: Map<string, number>;
    affectedItems: Array<{
      id: number;
      title: string;
      bannedTermsFound: string[];
    }>;
  };
  timestamps: {
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Count words in Turkish text
 * Handles Turkish characters properly
 */
function countWords(text: string): number {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Extract opening line (first sentence or first 100 chars)
 * Used for duplication detection
 */
function extractOpening(text: string, maxChars = 100): string {
  if (!text) return "";
  const firstSentence = text.split(/[.!?]/)[0];
  return (firstSentence || text).substring(0, maxChars).trim();
}

/**
 * Generate MD5 hash of first 100 characters
 * Groups similar content
 */
function hashOpening(text: string): string {
  const opening = extractOpening(text, 100);
  return crypto.createHash("md5").update(opening).digest("hex");
}

/**
 * Detect boilerplate openings
 * Returns matched boilerplate pattern if exists
 */
function detectBoilerplate(text: string): string | null {
  const opening = extractOpening(text, 50).toLowerCase();
  
  for (const pattern of BOILERPLATE_OPENINGS) {
    if (opening.includes(pattern.toLowerCase())) {
      return pattern;
    }
  }
  
  return null;
}

/**
 * Scan for AdSense-prohibited terms
 */
function scanForBannedTerms(text: string): string[] {
  const found: Set<string> = new Set();
  
  for (const pattern of BANNED_KEYWORDS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => found.add(match.toLowerCase()));
    }
  }
  
  return Array.from(found);
}

/**
 * Format report with nice colors and alignment
 */
function printReport(stats: ContentStats): void {
  const duration = stats.timestamps.durationMs
    ? `${(stats.timestamps.durationMs / 1000).toFixed(2)}s`
    : "N/A";

  console.log("\n");
  console.log("═".repeat(80));
  console.log("  📊 CONTENT QUALITY ANALYSIS REPORT - AdSense & HCU Safety Check");
  console.log("═".repeat(80));
  console.log(`\n📅 Timestamp: ${stats.timestamps.startTime.toISOString()}`);
  console.log(`⏱️  Duration: ${duration}`);
  console.log(`📦 Total Items Analyzed: ${stats.totalItems.toLocaleString()}`);
  console.log("\n");

  // ============= WORD COUNT SECTION =============
  console.log("┌─ 📝 WORD COUNT ANALYSIS");
  console.log(`├─ Thin Content (<300 words): ${stats.wordCount.thinContent} (${((stats.wordCount.thinContent / stats.totalItems) * 100).toFixed(1)}%)`);
  console.log(`│  ⚠️  Risk: Google may penalize thin content in HCU updates`);
  console.log(`├─ Medium Content (300-600 words): ${stats.wordCount.mediumContent} (${((stats.wordCount.mediumContent / stats.totalItems) * 100).toFixed(1)}%)`);
  console.log(`│  ℹ️  Acceptable but should consider expanding`);
  console.log(`├─ Rich Content (600+ words): ${stats.wordCount.richContent} (${((stats.wordCount.richContent / stats.totalItems) * 100).toFixed(1)}%)`);
  console.log(`│  ✅ Preferred for E-E-A-T signals`);
  console.log(`├─ Average: ${stats.wordCount.averageWords.toFixed(0)} words/item`);
  console.log(`├─ Min: ${stats.wordCount.minWords} words`);
  console.log(`└─ Max: ${stats.wordCount.maxWords} words`);
  console.log("\n");

  // ============= DUPLICATION SECTION =============
  console.log("┌─ 🔄 DUPLICATION & BOILERPLATE DETECTION");
  console.log(`├─ Items with Boilerplate Openings: ${stats.duplication.totalDuplicates} (${((stats.duplication.totalDuplicates / stats.totalItems) * 100).toFixed(1)}%)`);
  console.log(`│  ⚠️  Risk: Google penalizes repetitive/AI-generated patterns`);
  console.log(`├─ Unique Opening Patterns: ${stats.duplication.uniqueOpenings.size}`);
  console.log(`│`);
  
  // Top 10 repeated openings
  const topOpenings = stats.duplication.duplicateGroups
    .slice(0, 10)
    .sort((a, b) => b.count - a.count);
  
  if (topOpenings.length > 0) {
    console.log(`├─ Top Repeated Openings:`);
    topOpenings.forEach((group, idx) => {
      const riskLevel = group.count > 1000 ? "🔴 CRITICAL" : group.count > 500 ? "🟠 HIGH" : "🟡 MEDIUM";
      console.log(`│  ${idx + 1}. "${group.opening.substring(0, 60)}..." → ${group.count} items [${riskLevel}]`);
    });
  }
  console.log(`└─`);
  console.log("\n");

  // ============= ADSENSE RISKS SECTION =============
  console.log("┌─ 🚫 ADSENSE PROHIBITED CONTENT SCAN");
  console.log(`├─ Items with Banned Terms: ${stats.adSenseRisks.itemsWithBannedTerms} (${((stats.adSenseRisks.itemsWithBannedTerms / stats.totalItems) * 100).toFixed(1)}%)`);
  console.log(`│  🔴 CRITICAL: AdSense will reject or suspend account for policy violations`);
  console.log(`│`);
  
  if (stats.adSenseRisks.byCategory.size > 0) {
    console.log(`├─ Violations by Category:`);
    Array.from(stats.adSenseRisks.byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`│  • ${category}: ${count} items`);
      });
  }
  
  if (stats.adSenseRisks.affectedItems.length > 0) {
    console.log(`│`);
    console.log(`├─ First 10 Affected Items:`);
    stats.adSenseRisks.affectedItems.slice(0, 10).forEach((item, idx) => {
      console.log(`│  ${idx + 1}. [ID: ${item.id}] "${item.title}"`);
      console.log(`│     Terms: ${item.bannedTermsFound.slice(0, 3).join(", ")}`);
    });
  }
  console.log(`└─`);
  console.log("\n");

  // ============= SUMMARY & RECOMMENDATIONS =============
  console.log("┌─ 📋 OVERALL ASSESSMENT");
  
  const riskScore = calculateRiskScore(stats);
  const [riskLevel, emoji, color] = getRiskLevel(riskScore);
  
  console.log(`├─ Combined Risk Score: ${riskScore.toFixed(1)}/100 ${emoji} [${riskLevel}]`);
  console.log(`│`);
  console.log(`├─ Recommendations:`);
  
  if (stats.wordCount.thinContent > stats.totalItems * 0.1) {
    console.log(`│  1. 🎯 Expand thin content: ${stats.wordCount.thinContent} items (<300 words)`);
    console.log(`│     Action: Add structured sections (causes, psychology, Islamic view, etc.)`);
  }
  
  if (stats.duplication.totalDuplicates > stats.totalItems * 0.2) {
    console.log(`│  2. 🎯 Reduce boilerplate patterns: ${((stats.duplication.totalDuplicates / stats.totalItems) * 100).toFixed(1)}% items have repetitive openings`);
    console.log(`│     Action: Vary opening sentences, add unique intro per item`);
  }
  
  if (stats.adSenseRisks.itemsWithBannedTerms > 0) {
    console.log(`│  3. 🎯 URGENT: Remove banned content: ${stats.adSenseRisks.itemsWithBannedTerms} items violate AdSense policies`);
    console.log(`│     Action: Review items in analyze-content-quality-report.json, edit or archive`);
  }
  
  console.log(`│`);
  console.log(`└─ Next Steps:`);
  console.log(`   → Save: analyze-content-quality-report.json (full data)`);
  console.log(`   → Fix High-Risk Items: See AdSense violations list`);
  console.log(`   → Retest: Run this script after fixes to confirm improvements`);
  
  console.log("\n");
  console.log("═".repeat(80));
}

/**
 * Calculate overall risk score (0-100)
 */
function calculateRiskScore(stats: ContentStats): number {
  let score = 0;

  // Thin content weight: 20 points
  const thinContentPercentage = (stats.wordCount.thinContent / stats.totalItems) * 100;
  score += Math.min(20, (thinContentPercentage / 50) * 20); // 0-20 if >50% is thin

  // Duplication weight: 30 points
  const duplicatePercentage = (stats.duplication.totalDuplicates / stats.totalItems) * 100;
  score += Math.min(30, (duplicatePercentage / 50) * 30); // 0-30 if >50% is boilerplate

  // AdSense violations weight: 50 points (most critical)
  const violationPercentage = (stats.adSenseRisks.itemsWithBannedTerms / stats.totalItems) * 100;
  score += Math.min(50, (violationPercentage / 10) * 50); // 0-50 if >10% has banned terms

  return score;
}

/**
 * Get risk level and emoji
 */
function getRiskLevel(score: number): [string, string, string] {
  if (score < 20) return ["SAFE", "✅", "green"];
  if (score < 40) return ["LOW", "🟢", "green"];
  if (score < 60) return ["MEDIUM", "🟡", "yellow"];
  if (score < 80) return ["HIGH", "🟠", "orange"];
  return ["CRITICAL", "🔴", "red"];
}

/**
 * Save detailed report to JSON
 */
async function saveDetailedReport(stats: ContentStats): Promise<void> {
  const report = {
    timestamp: stats.timestamps.startTime,
    durationMs: stats.timestamps.durationMs,
    totalItemsAnalyzed: stats.totalItems,
    wordCountDistribution: {
      thinContent: {
        count: stats.wordCount.thinContent,
        percentage: ((stats.wordCount.thinContent / stats.totalItems) * 100).toFixed(2),
      },
      mediumContent: {
        count: stats.wordCount.mediumContent,
        percentage: ((stats.wordCount.mediumContent / stats.totalItems) * 100).toFixed(2),
      },
      richContent: {
        count: stats.wordCount.richContent,
        percentage: ((stats.wordCount.richContent / stats.totalItems) * 100).toFixed(2),
      },
      statistics: {
        average: stats.wordCount.averageWords.toFixed(2),
        min: stats.wordCount.minWords,
        max: stats.wordCount.maxWords,
      },
    },
    duplicationAnalysis: {
      totalWithBoilerplate: stats.duplication.totalDuplicates,
      percentage: ((stats.duplication.totalDuplicates / stats.totalItems) * 100).toFixed(2),
      uniqueOpenings: stats.duplication.uniqueOpenings.size,
      topRepeatedOpenings: stats.duplication.duplicateGroups.slice(0, 20),
    },
    adSenseRisks: {
      itemsWithBannedTerms: stats.adSenseRisks.itemsWithBannedTerms,
      percentage: ((stats.adSenseRisks.itemsWithBannedTerms / stats.totalItems) * 100).toFixed(2),
      byCategory: Object.fromEntries(stats.adSenseRisks.byCategory),
      affectedItems: stats.adSenseRisks.affectedItems.slice(0, 50), // First 50
    },
  };

  const fs = await import("fs").then((m) => m.promises);
  await fs.writeFile(
    "analyze-content-quality-report.json",
    JSON.stringify(report, null, 2)
  );

  console.log("\n💾 Detailed report saved: analyze-content-quality-report.json");
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

async function analyzeContentQuality(): Promise<void> {
  const stats: ContentStats = {
    totalItems: 0,
    wordCount: {
      thinContent: 0,
      mediumContent: 0,
      richContent: 0,
      averageWords: 0,
      minWords: Infinity,
      maxWords: 0,
    },
    duplication: {
      totalDuplicates: 0,
      uniqueOpenings: new Map(),
      duplicateGroups: [],
    },
    adSenseRisks: {
      itemsWithBannedTerms: 0,
      byCategory: new Map(),
      affectedItems: [],
    },
    timestamps: {
      startTime: new Date(),
    },
  };

  const BATCH_SIZE = 1000;
  let totalWordCount = 0;
  let processedBatches = 0;

  try {
    console.log(
      "🚀 Starting content quality analysis (batch size: 1000 items)...\n"
    );

    // Get total count
    const totalCount = await prisma.dream.count();
    console.log(`📦 Total items in database: ${totalCount.toLocaleString()}`);
    console.log(`⚙️  Processing in ${Math.ceil(totalCount / BATCH_SIZE)} batches...\n`);

    // Process in batches
    for (let skip = 0; skip < totalCount; skip += BATCH_SIZE) {
      processedBatches++;
      const progress = Math.min(skip + BATCH_SIZE, totalCount);
      console.log(
        `[${processedBatches}] Processing items ${skip + 1}-${progress} of ${totalCount}...`
      );

      const batch = await prisma.dream.findMany({
        select: {
          id: true,
          title: true,
          content: true,
        },
        skip,
        take: BATCH_SIZE,
      });

      // Analyze each item in batch
      for (const item of batch) {
        stats.totalItems++;

        // --- WORD COUNT ANALYSIS ---
        const wordCount = countWords(item.content || "");
        totalWordCount += wordCount;

        if (wordCount < 300) {
          stats.wordCount.thinContent++;
        } else if (wordCount < 600) {
          stats.wordCount.mediumContent++;
        } else {
          stats.wordCount.richContent++;
        }

        stats.wordCount.minWords = Math.min(stats.wordCount.minWords, wordCount);
        stats.wordCount.maxWords = Math.max(stats.wordCount.maxWords, wordCount);

        // --- DUPLICATION DETECTION ---
        const boilerplate = detectBoilerplate(item.content || "");
        if (boilerplate) {
          stats.duplication.totalDuplicates++;
          const count = stats.duplication.uniqueOpenings.get(boilerplate) || 0;
          stats.duplication.uniqueOpenings.set(boilerplate, count + 1);
        }

        // --- ADSENSE RISK SCANNING ---
        const bannedTerms = scanForBannedTerms(item.content || "");
        if (bannedTerms.length > 0) {
          stats.adSenseRisks.itemsWithBannedTerms++;
          stats.adSenseRisks.affectedItems.push({
            id: item.id,
            title: item.title,
            bannedTermsFound: bannedTerms,
          });

          // Track by category
          const category = bannedTerms[0];
          const catCount = stats.adSenseRisks.byCategory.get(category) || 0;
          stats.adSenseRisks.byCategory.set(category, catCount + 1);
        }
      }
    }

    // Calculate averages
    stats.wordCount.averageWords = totalWordCount / stats.totalItems;

    // Build duplicate groups for reporting
    stats.duplication.duplicateGroups = Array.from(
      stats.duplication.uniqueOpenings.entries()
    ).map(([opening, count]) => ({ opening, count }));

    // Finish timing
    stats.timestamps.endTime = new Date();
    stats.timestamps.durationMs =
      stats.timestamps.endTime.getTime() - stats.timestamps.startTime.getTime();

    // Print report
    printReport(stats);

    // Save detailed JSON report
    await saveDetailedReport(stats);
  } catch (error) {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// RUN ANALYSIS
// ============================================

analyzeContentQuality();
