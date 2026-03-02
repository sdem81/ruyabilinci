const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

Promise.all([
  p.dream.count(),
  p.dream.count({ where: { content: { equals: '' } } }),
  p.dream.aggregate({ _avg: { wordCount: true }, _min: { wordCount: true }, _max: { wordCount: true } }),
  p.dream.findMany({ take: 20, select: { metaDescription: true }, orderBy: { id: 'asc' } }),
  p.dream.findMany({ take: 30, select: { id: true, content: true }, orderBy: { id: 'asc' } }),
]).then(([total, emptyC, agg, metas, contents]) => {
  console.log('=== STATS ===');
  console.log('TOTAL:', total, '| EMPTY:', emptyC);
  console.log('AVG_WORDS:', Math.round(agg._avg.wordCount), '| MIN:', agg._min.wordCount, '| MAX:', agg._max.wordCount);
  
  console.log('\n=== META DESCRIPTION LENGTHS ===');
  const metaLengths = metas.map(m => m.metaDescription?.length || 0);
  console.log('Lengths:', metaLengths.join(', '));
  console.log('Under 150:', metaLengths.filter(l => l < 150).length, '| Over 160:', metaLengths.filter(l => l > 160).length);

  console.log('\n=== REPETITION ANALYSIS ===');
  // Check how many contents share same sections
  const secondParagraphs = contents.map(c => {
    const lines = c.content?.split('\n') || [];
    return lines.slice(3, 6).join('|').substring(0, 100);
  });
  const uniqueSecondParagraphs = new Set(secondParagraphs).size;
  console.log('Sample 30 dreams, unique second-paragraph snippets:', uniqueSecondParagraphs, '/ 30');
  
  // Check heading uniqueness
  const headings = contents.map(c => {
    const matches = c.content?.match(/^## .+/gm) || [];
    return matches.join('|');
  });
  const uniqueHeadings = new Set(headings).size;
  console.log('Unique H2 cluster combos:', uniqueHeadings, '/ 30');
  
  // Check positive block headings
  const posHeadings = contents.map(c => {
    const m = c.content?.match(/### (.+)\n\n/);
    return m ? m[1] : '?';
  });
  console.log('\nPositive block heading variety (first 30):');
  const posCount = {};
  posHeadings.forEach(h => { posCount[h] = (posCount[h] || 0) + 1; });
  Object.entries(posCount).sort((a,b)=>b[1]-a[1]).forEach(([h,c]) => console.log(' '+c+'x: '+h));

  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
