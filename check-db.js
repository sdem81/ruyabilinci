const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const dreamCount = await prisma.dream.count();
  const categoryCount = await prisma.category.count();
  const publishedCount = await prisma.dream.count({ where: { isPublished: true } });
  
  console.log('📊 Veritabanı İstatistikleri:');
  console.log(`✅ Toplam Rüya: ${dreamCount.toLocaleString('tr-TR')}`);
  console.log(`✅ Yayında: ${publishedCount.toLocaleString('tr-TR')}`);
  console.log(`✅ Kategori: ${categoryCount.toLocaleString('tr-TR')}`);
  
  const sample = await prisma.dream.findMany({ take: 3, select: { id: true, title: true, slug: true } });
  console.log('\n📋 Örnek Kayıtlar:');
  sample.forEach(d => console.log(`  - [${d.id}] ${d.title}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
