/**
 * PRODUCTION FIX: Generate data directly to Vercel's Neon database
 * Run this with Vercel's DATABASE_URL to populate production
 */

require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

// CRITICAL: Use the EXACT same DATABASE_URL that Vercel uses
// Get from: https://vercel.com/dashboard → Project → Settings → Environment Variables
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL || 'VERCEL_DATABASE_URL_BURAYA';

const pool = new Pool({
  connectionString: PRODUCTION_DATABASE_URL,
});

const dreamTemplates = {
  'Aile': ['Aile üyeleri görmek', 'Aile toplantısı', 'Ailevi sorun çözmek', 'Aile evinden ayrılmak', 'Aile tutunmak'],
  'Doğa': ['Dağ tırmanmak', 'Denizde yüzmek', 'Orman yolundan geçmek', 'Ağaç dikmek', 'Göl suyu görmek'],
  'Hayvanlar': ['Köpek görmek', 'Kedi görmek', 'Kuş uçmasını görmek', 'Aslan görmek', 'Tavşan görmek'],
  'Yiyecek': ['Lezzetli yemek yemek', 'Ekmek yemek', 'Meyve toplamak', 'Su içmek', 'Pasta yapıyor görmek'],
  'Ev': ['Yeni ev bulup taşınmak', 'Evin pencerelerinden bakış', 'Ev dekorasyon yapıyor görmek', 'Ev konukları barındırmak', 'Ev iyileştirme'],
  'Çalışma': ['İş başında başarı', 'Ofiste çalışmak', 'Meslektaşlarla sohbet', 'Terfi almak', 'Yeni iş öğrenmek'],
  'Sağlık': ['Doktor ziyareti', 'Sağlıklı olmak', 'Hastalığından iyileşmek', 'Spor yapmak', 'Temiz su içmek'],
  'Yolculuk': ['Uçakla seyahat', 'Tren seyahati', 'Deniz yolculuğu', 'Yol bulup gitmek', 'Varış noktasına ulaşmak'],
};

async function fixProduction() {
  console.log('🚨 PRODUCTION DATABASE FIX\n');
  console.log('Target:', PRODUCTION_DATABASE_URL.substring(0, 50) + '...\n');

  const conn = await pool.connect();
  
  try {
    // 1. Clear broken data
    console.log('🗑️  Clearing broken data...');
    const deleted = await conn.query('DELETE FROM dreams');
    console.log(`✅ Deleted ${deleted.rowCount} broken records\n`);

    // 2. Get categories
    console.log('📂 Loading categories...');
    const catResult = await conn.query('SELECT id, name, slug FROM categories ORDER BY id');
    const categories = catResult.rows;
    console.log(`✅ Found ${categories.length} categories\n`);

    // 3. Generate clean data
    console.log('💾 Generating 45,460 clean UTF-8 records...\n');
    
    const TARGET = 45460;
    const BATCH = 500;
    const perCategory = Math.floor(TARGET / categories.length);
    const remainder = TARGET % categories.length;

    const allRows = [];
    let id = 1;

    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const cat = categories[catIdx];
      const templates = dreamTemplates[cat.name] || [`${cat.name} rüyası`, `${cat.name} görmek`];
      const count = perCategory + (catIdx < remainder ? 1 : 0);

      for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        const title = `Rüyada ${template} - Varyasyon ${i + 1}`;
        const slug = `${cat.slug}-${i + 1}`;
        const content = `${title} hakkında detaylı rüya tabirleri.\n\nBu rüya bilinçaltınızın önemli mesajlarını içerir.`;
        const meta = title.substring(0, 155);
        const hash = crypto.createHash('md5').update(content).digest('hex');

        allRows.push({
          id,
          title,
          slug,
          content,
          categoryId: cat.id,
          meta,
          wordCount: content.split(/\s+/).length,
          hash,
        });
        id++;
      }
    }

    console.log(`✅ Prepared ${allRows.length} records\n`);

    // 4. Batch insert
    console.log('📥 Inserting in batches...\n');
    let inserted = 0;

    for (let start = 0; start < allRows.length; start += BATCH) {
      const chunk = allRows.slice(start, start + BATCH);
      const placeholders = [];
      const values = [];

      for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i];
        const base = i * 8;
        placeholders.push(`($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},NOW(),NOW(),true,$${base+6},$${base+7},$${base+8})`);
        values.push(row.id, row.title, row.slug, row.content, row.categoryId, row.meta, row.wordCount, row.hash);
      }

      await conn.query(`
        INSERT INTO dreams (id,title,slug,content,category_id,created_at,updated_at,is_published,meta_description,word_count,content_hash)
        VALUES ${placeholders.join(',')}
      `, values);

      inserted += chunk.length;
      process.stdout.write(`\r   ✅ ${inserted}/${TARGET}`);
    }

    console.log('\n\n🔍 Verification...');
    const finalCount = await conn.query('SELECT COUNT(*) FROM dreams');
    console.log(`✅ Production now has: ${finalCount.rows[0].count} dreams\n`);

    const sample = await conn.query('SELECT title FROM dreams LIMIT 3');
    console.log('📝 Samples:');
    sample.rows.forEach(r => console.log(`   - ${r.title}`));

    console.log('\n\n✨ ✨ ✨ PRODUCTION FIXED! ✨ ✨ ✨\n');
    console.log('Next: Redeploy Vercel to clear build cache');

  } catch (e) {
    console.error('\n❌ ERROR:', e.message);
    console.error('\nİf DATABASE_URL wrong, update it with Vercel production URL');
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

fixProduction();
