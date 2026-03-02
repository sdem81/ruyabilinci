const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Testing Prisma connection...\n');
    
    const dreamCount = await prisma.dream.count();
    console.log('✅ Total dreams:', dreamCount);
    
    const catCount = await prisma.category.count();
    console.log('✅ Total categories:', catCount);
    
    const sample = await prisma.dream.findFirst({
      include: { category: true }
    });
    console.log('\n📝 Sample dream:');
    console.log('   Title:', sample?.title);
    console.log('   Category:', sample?.category?.name);
    console.log('   Slug:', sample?.slug);
    
    const dreamsByCat = await prisma.dream.findMany({
      where: { categoryId: 12 },
      take: 2,
      include: { category: true }
    });
    console.log('\n📂 Category 12 (Giyim) samples:');
    dreamsByCat.forEach(d => console.log('   -', d.title));
    
  } catch (e) {
    console.error('\n❌ ERROR:', e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
