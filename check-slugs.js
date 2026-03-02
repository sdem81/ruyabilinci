require('dotenv').config();
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Check slugs
  const res = await pool.query(`SELECT slug FROM dreams WHERE slug LIKE '%adetli%' LIMIT 5`);
  console.log('Slugs in Neon:');
  res.rows.forEach(r => console.log('  ', r.slug));
  
  await pool.end();
})();
