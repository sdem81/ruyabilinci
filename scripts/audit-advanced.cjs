const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function runAudit() {
  console.log("Fetching 120 random dreams for analysis...");
  
  // Fetch 120 random dreams
  const count = await prisma.dream.count({ where: { content: { not: '' } } });
  const skip = Math.max(0, Math.floor(Math.random() * (count - 120)));
  const dreams = await prisma.dream.findMany({
    where: { content: { not: '' } },
    select: { id: true, title: true, slug: true, content: true, wordCount: true },
    take: 120,
    skip: skip
  });

  console.log(`Fetched ${dreams.length} dreams.`);

  let totalLinks = 0;
  let pagesWithLowLinks = 0;
  
  const introClusters = new Map();
  const h2Clusters = new Map();
  
  let totalSpecificityScore = 0;
  let lowSpecificityCount = 0;

  const ngrams4 = new Map();
  const ngrams6 = new Map();

  dreams.forEach(dream => {
    const content = dream.content || '';
    
    // 1. Internal Links
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    totalLinks += links;
    if (links < 2) pagesWithLowLinks++;

    // 2. Intro similarity (first 150 chars)
    const intro = content.split('\n').find(line => line.length > 50 && !line.startsWith('#')) || '';
    const introHash = crypto.createHash('md5').update(intro.slice(0, 100)).digest('hex');
    introClusters.set(introHash, (introClusters.get(introHash) || 0) + 1);

    // 3. H2 distribution
    const h2s = (content.match(/^##\s+(.*)/gm) || []).join('|');
    const h2Hash = crypto.createHash('md5').update(h2s).digest('hex');
    h2Clusters.set(h2Hash, (h2Clusters.get(h2Hash) || 0) + 1);

    // 4. N-grams (simple approximation by splitting words)
    const words = content.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i < words.length - 3; i++) {
      const gram4 = words.slice(i, i + 4).join(' ');
      ngrams4.set(gram4, (ngrams4.get(gram4) || 0) + 1);
    }
    for (let i = 0; i < words.length - 5; i++) {
      const gram6 = words.slice(i, i + 6).join(' ');
      ngrams6.set(gram6, (ngrams6.get(gram6) || 0) + 1);
    }

    // 5. Semantic Specificity (Heuristic: how many times the title words appear outside the H1/H2s)
    const titleWords = dream.title.toLowerCase().replace('rüyada', '').trim().split(/\s+/).filter(w => w.length > 3);
    const bodyText = content.replace(/^#.*$/gm, '').toLowerCase();
    let titleWordMentions = 0;
    titleWords.forEach(tw => {
      const regex = new RegExp(tw, 'g');
      titleWordMentions += (bodyText.match(regex) || []).length;
    });
    
    // Specificity score out of 100
    let specificity = Math.min(100, (titleWordMentions / Math.max(1, titleWords.length)) * 20);
    // Add points if it has specific historical/psychological terms
    if (bodyText.includes('jung') || bodyText.includes('freud') || bodyText.includes('ibn sirin')) specificity += 20;
    if (bodyText.includes('örnek vermek gerekirse')) specificity += 10;
    
    specificity = Math.min(100, specificity);
    totalSpecificityScore += specificity;
    if (specificity < 50) lowSpecificityCount++;
  });

  // Calculate metrics
  const avgLinks = totalLinks / dreams.length;
  
  // Template footprint
  const maxIntroClusterSize = Math.max(...Array.from(introClusters.values()));
  const maxH2ClusterSize = Math.max(...Array.from(h2Clusters.values()));
  
  // Find most common 6-grams
  const sorted6Grams = Array.from(ngrams6.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  console.log("\n=== AUDIT RESULTS ===");
  console.log(`Avg Internal Links: ${avgLinks.toFixed(2)}`);
  console.log(`Pages with < 2 links: ${pagesWithLowLinks}`);
  console.log(`Intro Clusters: ${introClusters.size}`);
  console.log(`Max Intro Cluster Size: ${maxIntroClusterSize} (${((maxIntroClusterSize/dreams.length)*100).toFixed(1)}%)`);
  console.log(`H2 Clusters: ${h2Clusters.size}`);
  console.log(`Max H2 Cluster Size: ${maxH2ClusterSize} (${((maxH2ClusterSize/dreams.length)*100).toFixed(1)}%)`);
  console.log(`Avg Specificity Score: ${(totalSpecificityScore / dreams.length).toFixed(1)}`);
  console.log(`Pages with Specificity < 50: ${lowSpecificityCount}`);
  console.log("\nTop 6-grams:");
  sorted6Grams.forEach(([gram, count]) => console.log(`- "${gram}": ${count} times`));

  await prisma.$disconnect();
}

runAudit().catch(console.error);
