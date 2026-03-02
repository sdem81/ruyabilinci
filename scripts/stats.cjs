const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const [stats] = await p.$queryRaw`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE "isPublished" = true) AS published,
      COUNT(*) FILTER (WHERE content IS NOT NULL AND content != '') AS with_content,
      ROUND(AVG(array_length(regexp_split_to_array(trim(content), E'\\s+'), 1))
            FILTER (WHERE content IS NOT NULL AND content != '')) AS avg_words,
      MIN(array_length(regexp_split_to_array(trim(content), E'\\s+'), 1))
            FILTER (WHERE content IS NOT NULL AND content != '') AS min_words,
      MAX(array_length(regexp_split_to_array(trim(content), E'\\s+'), 1))
            FILTER (WHERE content IS NOT NULL AND content != '') AS max_words
    FROM dreams
  `;
  const cats = await p.category.count();
  const sample = await p.dream.findMany({
    take: 3, select: { title: true, slug: true, shortSummary: true }, orderBy: { id: 'asc' }
  });
  console.log('\n=== VERİTABANI İSTATİSTİKLERİ ===');
  console.log('Toplam rüya      :', Number(stats.total));
  console.log('Yayımlanan       :', Number(stats.published));
  console.log('İçerik olan      :', Number(stats.with_content));
  console.log('Kategori sayısı  :', cats);
  console.log('Ort. kelime/sayfa:', Number(stats.avg_words));
  console.log('Min kelime       :', Number(stats.min_words));
  console.log('Maks kelime      :', Number(stats.max_words));
  console.log('\n=== ÖRNEK BAŞLIKLAR ===');
  sample.forEach(d => {
    console.log(' * ' + d.title);
    console.log('   /ruya/' + d.slug);
    console.log('   Meta: ' + (d.shortSummary || '').substring(0,90));
  });
  // Eski satırlar artık kullanılmıyor:
  const total = Number(stats.total);
  const published = Number(stats.published);
  const avgWords = await p.$queryRaw`SELECT AVG(array_length(regexp_split_to_array(trim(content), '\s+'), 1)) as avg_words FROM dreams WHERE content IS NOT NULL AND content != ''`;
  const minWords = await p.$queryRaw`SELECT MIN(array_length(regexp_split_to_array(trim(content), '\s+'), 1)) as min_words FROM dreams WHERE content IS NOT NULL AND content != ''`;
  const maxWords = await p.$queryRaw`SELECT MAX(array_length(regexp_split_to_array(trim(content), '\s+'), 1)) as max_words FROM dreams WHERE content IS NOT NULL AND content != ''`;
  const cats = await p.category.count();
  const sample = await p.dream.findMany({ take: 3, select: { title: true, slug: true, shortSummary: true }, orderBy: { id: 'asc' } });
  console.log('=== VERİTABANI İSTATİSTİKLERİ ===');
  console.log('Toplam rüya      :', total);
  console.log('Yayımlanan       :', published);
  console.log('İçerik olan      :', withContent);
  console.log('Kategori         :', cats);
  console.log('Ort. kelime      :', Math.round(avgWords[0].avg_words));
  console.log('Min kelime       :', minWords[0].min_words);
  console.log('Maks kelime      :', maxWords[0].max_words);
  console.log('\n=== ÖRNEK BAŞLIKLAR ===');
  sample.forEach(d => console.log(` - ${d.title}\n   /ruya/${d.slug}\n   Meta: ${d.shortSummary?.substring(0,80)}`));
}
main().catch(console.error).finally(() => p.$disconnect());
