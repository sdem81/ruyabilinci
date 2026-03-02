require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END) as with_content
      FROM dreams
    `);
    
    console.log('📊 İlerleme Durumu:');
    console.log('Toplam rüya:', result.rows[0].total);
    console.log('İçerik oluşturuldu:', result.rows[0].with_content);
    console.log('Bekleyen:', result.rows[0].total - result.rows[0].with_content);
    console.log('Tamamlanma:', ((result.rows[0].with_content / result.rows[0].total) * 100).toFixed(1) + '%');
  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await pool.end();
  }
})();
