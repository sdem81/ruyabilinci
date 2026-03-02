/**
 * Başlıkları temizler: "A;B;C" → "A" (ilk parçayı al)
 * Ardından içerikleri de günceller.
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Semicolon içeren başlıkları bul
  const dirty = await p.dream.findMany({
    where: { title: { contains: ';' } },
    select: { id: true, title: true },
  });

  console.log(`Temizlenecek: ${dirty.length} başlık`);
  if (dirty.length === 0) { console.log('Temiz!'); return; }

  // İlk örneği göster
  const sample = dirty[0];
  const cleaned = sample.title.split(';')[0].trim();
  console.log(`Örnek: "${sample.title.substring(0, 80)}" → "${cleaned}"`);

  // Onay bekle (sadece çalıştırma — hızlı güncelle)
  let updated = 0;
  const BATCH = 500;
  for (let i = 0; i < dirty.length; i += BATCH) {
    const batch = dirty.slice(i, i + BATCH);
    await Promise.all(batch.map(async (d) => {
      const clean = d.title.split(';')[0].trim();
      if (clean !== d.title) {
        await p.dream.update({
          where: { id: d.id },
          data: { title: clean },
        });
        updated++;
      }
    }));
    process.stdout.write(`\r  Güncellendi: ${updated}/${dirty.length}`);
  }

  console.log(`\n✅ ${updated} başlık temizlendi.`);
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(() => p.$disconnect());
