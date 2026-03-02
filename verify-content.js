require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    // İçerik uzunluklarını kontrol et
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END) as with_long_content,
        MIN(LENGTH(content)) as min_len,
        MAX(LENGTH(content)) as max_len,
        AVG(LENGTH(content))::INTEGER as avg_len
      FROM dreams
    `);
    
    console.log('📊 İÇERİK İSTATİSTİKLERİ:');
    console.log('Toplam rüya:', stats.rows[0].total);
    console.log('Uzun içerik (>500 char):', stats.rows[0].with_long_content);
    console.log('Min uzunluk:', stats.rows[0].min_len, 'chars');
    console.log('Max uzunluk:', stats.rows[0].max_len, 'chars');
    console.log('Ortalama:', stats.rows[0].avg_len, 'chars');
    
    // Rastgele 3 rüyayı tam içeriğiyle göster
    const samples = await pool.query(`
      SELECT id, title, content, LENGTH(content) as len
      FROM dreams
      ORDER BY RANDOM()
      LIMIT 3
    `);
    
    console.log('\n📋 RASTGELE 3 RÜYA ÖRNEĞİ:\n');
    samples.rows.forEach((dream, idx) => {
      console.log(`=== ÖRNEK ${idx + 1} ===`);
      console.log(`ID: ${dream.id}`);
      console.log(`Başlık: ${dream.title}`);
      console.log(`Uzunluk: ${dream.len} karakter`);
      console.log(`İçerik:\n${dream.content}\n`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
})();
