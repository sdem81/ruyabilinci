/**
 * Tüm rüyaların slug'larını, mevcut (temiz) title'dan yeniden üretir.
 * Çakışmaları -2, -3, ... eklenerek çözülür.
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

function slugify(text) {
  const map = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, m => map[m] || m)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  const dreams = await p.dream.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { id: 'asc' },
  });

  console.log(`Toplam: ${dreams.length} rüya`);

  // Önce hangi slug'ların değişmesi gerektiğini bul
  const usedSlugs = new Set();
  const updates = [];

  for (const dream of dreams) {
    const newSlug = slugify(dream.title);
    
    // Benzersiz slug üret
    let finalSlug = newSlug;
    let counter = 2;
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${newSlug}-${counter++}`;
    }
    usedSlugs.add(finalSlug);

    if (finalSlug !== dream.slug) {
      updates.push({ id: dream.id, slug: finalSlug, oldSlug: dream.slug });
    }
  }

  console.log(`Güncellenecek slug: ${updates.length}`);
  if (updates.length === 0) {
    console.log('✅ Tüm sluglar temiz!');
    return;
  }

  // Örnek göster
  const sample = updates[0];
  console.log(`\nÖrnek:`);
  console.log(`  Eski: "${sample.oldSlug?.substring(0, 80)}"`);
  console.log(`  Yeni: "${sample.slug}"`);

  // Batch güncelle
  let updated = 0;
  const BATCH = 200;
  
  // Önce tüm slug'ları geçici unique değerlerle değiştir (çakışma önlemek için)
  console.log('\nAdım 1: Geçici slug\'lar ayarlanıyor...');
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    await Promise.all(batch.map(u =>
      p.dream.update({ where: { id: u.id }, data: { slug: `__tmp_${u.id}__` } })
    ));
    process.stdout.write(`\r  ${Math.min(i + BATCH, updates.length)}/${updates.length}`);
  }

  // Sonra gerçek slug'ları ata
  console.log('\nAdım 2: Gerçek slug\'lar atanıyor...');
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    await Promise.all(batch.map(u =>
      p.dream.update({ where: { id: u.id }, data: { slug: u.slug } })
    ));
    updated += batch.length;
    process.stdout.write(`\r  ${updated}/${updates.length}`);
  }

  console.log(`\n\n✅ ${updated} slug güncellendi.`);
  
  // Özet
  const sample2 = updates[0];
  const check = await p.dream.findUnique({ where: { id: sample2.id }, select: { title: true, slug: true }});
  console.log(`\nDoğrulama: "${check.title}" → /ruya/${check.slug}`);
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(() => p.$disconnect());
