require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CORRECT_CATEGORIES = [
  { id: 1, name: 'Aile', slug: 'aile' },
  { id: 2, name: 'Genel', slug: 'genel' },
  { id: 3, name: 'Duygular', slug: 'duygular' },
  { id: 4, name: 'Hayvanlar', slug: 'hayvanlar' },
  { id: 5, name: 'Değerli Eşyalar', slug: 'degerli-esyalar' },
  { id: 6, name: 'Ruhani', slug: 'ruhani' },
  { id: 7, name: 'İlişkiler', slug: 'iliskiler' },
  { id: 8, name: 'Ev & Mekan', slug: 'ev-mekan' },
  { id: 9, name: 'Sağlık', slug: 'saglik' },
  { id: 10, name: 'Yiyecek & İçecek', slug: 'yiyecek-icecek' },
  { id: 11, name: 'Araç & Taşıt', slug: 'arac-tasit' },
  { id: 12, name: 'Giyim', slug: 'giyim' },
  { id: 13, name: 'Doğa', slug: 'doga' },
  { id: 14, name: 'Namaz', slug: 'namaz' },
  { id: 16, name: 'Ölüm & Kayıp', slug: 'olum-kayip' },
];

(async () => {
  const conn = await pool.connect();
  
  try {
    console.log('🔧 Fixing category names with correct UTF-8...\n');
    
    for (const cat of CORRECT_CATEGORIES) {
      await conn.query(
        'UPDATE categories SET name = $1, slug = $2 WHERE id = $3',
        [cat.name, cat.slug, cat.id]
      );
      console.log(`✅ Updated: ${cat.id} - ${cat.name}`);
    }
    
    console.log('\n✅ All categories fixed!');
    
    const verify = await conn.query('SELECT id, name, slug FROM categories ORDER BY id');
    console.log('\n📋 Verification:');
    verify.rows.forEach(c => console.log(`   ${c.id}. ${c.name} (${c.slug})`));
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    conn.release();
    await pool.end();
  }
})();
