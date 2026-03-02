import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

interface Metrics {
  wordCount: number;
  bigramRepeat: number;
  trigramRepeat: number;
  paragraphRepeatRatio: number;
  sentenceRepeatRatio: number;
  hasInternalLink: boolean;
  riskScore: number;
}

const prisma = new PrismaClient();

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function ngramRepeatRatio(text: string, n: number): number {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length < n + 1) return 0;
  const freq: Record<string, number> = {};
  for (let i = 0; i <= tokens.length - n; i++) {
    const key = tokens.slice(i, i + n).join(" ");
    freq[key] = (freq[key] || 0) + 1;
  }
  const total = Object.values(freq).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(freq));
  return total === 0 ? 0 : max / total;
}

function repeatRatioByHash(chunks: string[]): number {
  if (chunks.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const c of chunks) {
    const h = createHash("sha1").update(normalize(c)).digest("hex");
    freq[h] = (freq[h] || 0) + 1;
  }
  const dupCount = Object.values(freq).filter((c) => c > 1).length;
  return dupCount / chunks.length;
}

function hasInternalLink(text: string): boolean {
  const regex = /\[[^\]]+\]\((\/ruya\/[^)]+)\)/i;
  return regex.test(text);
}

function scoreRisk(m: Metrics): number {
  let score = 0;
  if (m.bigramRepeat > 0.30) score += 20;
  if (m.trigramRepeat > 0.20) score += 20;
  if (m.paragraphRepeatRatio > 0.15) score += 20;
  if (m.sentenceRepeatRatio > 0.10) score += 15;
  if (!m.hasInternalLink) score += 10;
  if (m.wordCount < 180) score += 15;
  return Math.min(100, Math.max(0, score));
}

function computeMetrics(body: string): Metrics {
  const wordCountVal = wordCount(body);
  const bigramRepeat = ngramRepeatRatio(body, 2);
  const trigramRepeat = ngramRepeatRatio(body, 3);
  const paragraphRepeatRatio = repeatRatioByHash(splitParagraphs(body));
  const sentenceRepeatRatio = repeatRatioByHash(splitSentences(body));
  const linkFlag = hasInternalLink(body);
  const tmp: Metrics = {
    wordCount: wordCountVal,
    bigramRepeat,
    trigramRepeat,
    paragraphRepeatRatio,
    sentenceRepeatRatio,
    hasInternalLink: linkFlag,
    riskScore: 0,
  };
  tmp.riskScore = scoreRisk(tmp);
  return tmp;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const slugArg = args.find((a) => a.startsWith("--slug="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 50;
  const slug = slugArg ? slugArg.split("=")[1] : undefined;

  const dreams = await prisma.dream.findMany({
    where: slug ? { slug } : undefined,
    select: { id: true, slug: true, title: true, content: true },
    take: limit,
    orderBy: { id: "asc" },
  });

  for (const d of dreams) {
    const metrics = computeMetrics(d.content || "");
    console.log(
      JSON.stringify(
        {
          id: d.id,
          slug: d.slug,
          title: d.title,
          ...metrics,
        },
        null,
        2
      )
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
