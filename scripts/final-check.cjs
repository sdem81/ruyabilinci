const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.dream.findMany({
  where: { title: { startsWith: 'Rüyada' } },
  select: { title: true, metaDescription: true, content: true, wordCount: true },
  take: 8,
}).then(rows => {
  rows.forEach(r => {
    const hasDup    = r.metaDescription?.toLowerCase().includes('rüyada rüyada');
    const hasTOC    = r.content?.includes('İçindekiler');
    const hasOldFAQ = r.content?.includes('**S:');
    const hasOldBP  = r.content?.includes('binlerce yıllık kökleri');
    const metaLen   = r.metaDescription?.length ?? 0;
    console.log(
      r.title.slice(0, 38).padEnd(40),
      '| wc:', String(r.wordCount).padStart(4),
      '| meta:', String(metaLen).padStart(3),
      '| metaDup:', String(hasDup).padStart(5),
      '| TOC:', String(hasTOC).padStart(5),
      '| oldFAQ:', String(hasOldFAQ).padStart(5),
      '| oldBoil:', String(hasOldBP).padStart(5)
    );
  });
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
