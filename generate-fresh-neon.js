/**
 * Generate all 45,460 dreams with proper UTF-8 encoding
 * Creates fresh clean data directly in Neon PostgreSQL
 */

require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Dream interpretation templates
const dreamTemplates = {
  'Aile': [
    'Aile üyeleri görmek rüyası: Ailenizle ilgili duygusal bağlantıları temsil eder',
    'Aile toplantısı görmek: Aile içi iletişim ve uyumu işaret eder',
    'Ailevi sorun çözmek: Yaşam zorlukları üstesinden gelmeyi gösterir',
    'Aile evinden ayrılmak: Bağımsızlık arzusunu yansıtır',
    'Aile tutunmak: Güvenlik ve koruma ihtiyacını gösterir',
  ],
  'Doğa': [
    'Dağ tırmanmak rüyası: Zorlukları aşma ve başarı elde etmeyi işaret eder',
    'Denizde yüzmek: Duygusal hürriyet ve keşif isteğini gösterir',
    'Orman yolundan geçmek: Hayatın karmaşıklıklarını navigasyon etmeyi anlatar',
    'Ağaç diktiğinin rüyası: Büyüme ve kalkınmayı sembolize eder',
    'Göl suyu görmek: İç dünya ve bilinçaltını işaret eder',
  ],
  'Hayvanlar': [
    'Köpek görmek rüyası: Sadakat ve arkadaşlığı temsil eder',
    'Kedi görmek: Bağımsızlık ve çekingenliği işaret eder',
    'Kuş uçmasını görmek: Özgürlük ve ilham arzusunu yansıtır',
    'Aslan görmek: Güç ve cesaretin sembolüdür',
    'Tavşan görmek: Hızlılık ve zeka ihtiyacını gösterir',
  ],
  'Yiyecek': [
    'Lezzetli yemek yemek: Doyum ve nimetleri gösterir',
    'Ekmek yemek: Temiz geçim ve beslenmeyi işaret eder',
    'Meyve toplamak: Başarı ve bereketin sembolüdür',
    'Su içmek: İç dünyayı temizlemeyi ve yenilenmeyi gösterir',
    'Pasta yapıyor görmek: Sevinç ve kutlama hissiyatını yansıtır',
  ],
  'Ev': [
    'Yeni ev bulup taşınmak: Yeni başlangıç ve değişimi gösterir',
    'Evin pencerelerinden bakış: Hayata farklı perspektifli bakışı işaret eder',
    'Ev dekorasyon yapıyor görmek: Kendinizi yenileme isteğini yansıtır',
    'Ev konukları barındırmak: Açık kalplilik ve paylaşımı sembolize eder',
    'Ev iyileştirme: Kişisel gelişimi ve iyileşmeyi gösterir',
  ],
  'Çalışma': [
    'İş başında başarı: Kariyer gelişimini ve başarıyı işaret eder',
    'Ofiste çalışmak: Sorumluluk ve yapıcı uğraş yansıtır',
    'Meslektaşlarla sohbet: Sosyal bağlantıları güçlendirmeyi gösterir',
    'Terfi almak rüyası: İlerleme ve tanınma arzusunu sembolize eder',
    'Yeni iş öğrenmek: Gelişim ve öğrenme isteğini gösterir',
  ],
  'Sağlık': [
    'Doktor ziyareti: Şifa ve iyileşmeyi işaret eder',
    'Sağlıklı olmak: Vitality ve güçlü kişiliği yansıtır',
    'Hastalığından iyileşmek: Zorlukların üstesinden gelmeyi gösterir',
    'Spor yapmak: Disiplin ve öz-kontrol sembolüdür',
    'Temiz su içmek: Arınma ve yenilenmeyi işaret eder',
  ],
  'Yolculuk': [
    'Uçakla seyahat: Ruhsal yolculuk ve hayal gücünü gösterir',
    'Tren seyahati: Yaşam yolunda düzenli ilerleme işaret eder',
    'Deniz yolculuğu: Duyguları keşfetmeyi ve macerayı yansıtır',
    'Yol bulup gitmek: Yaşam amacını araştırmayı sembolize eder',
    'Varış noktasına ulaşmak: Hedef ve başarıyı işaret eder',
  ],
};

async function generateAllDreams() {
  const TARGET_COUNT = 45460;
  const BATCH_SIZE = 500;

  console.log('🚀 GENERATING 45,460 FRESH DREAMS WITH UTF-8\n');
  
  let conn;
  try {
    conn = await neonPool.connect();

    // Clear existing
    console.log('🗑️  Clearing existing dreams...');
    const deleteRes = await conn.query('DELETE FROM dreams');
    console.log(`✅ Deleted ${deleteRes.rowCount} dreams\n`);

    // Get all categories
    console.log('📂 Loading categories...');
    const catRes = await conn.query('SELECT id, name, slug FROM categories ORDER BY id');
    const categories = catRes.rows;
    console.log(`✅ Found ${categories.length} categories\n`);

    if (categories.length === 0) {
      console.error('❌ No categories found in Neon!');
      process.exit(1);
    }

    // Generate dreams
    console.log('💾 Preparing dream records...\n');

    let id = 1;
    const allRows = [];
    const dreamsPerCategory = Math.floor(TARGET_COUNT / categories.length);
    const remainder = TARGET_COUNT % categories.length;

    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const category = categories[categoryIndex];
      const categoryDreams = dreamTemplates[category.name] || [
        `${category.name} rüyası: Bilinçaltınızın mesajlaştırması`,
        `${category.name} görmek: İç dünyayı ekspresyon kanalaştırma`,
      ];

      const countForCategory = dreamsPerCategory + (categoryIndex < remainder ? 1 : 0);

      for (let i = 0; i < countForCategory; i++) {
        const templateIndex = i % categoryDreams.length;
        const templateText = categoryDreams[templateIndex];

        // Create variations with numbers
        const title = `${category.name} - ${templateText.split(':')[0].trim()} (Varyasyon ${i + 1})`;
        const slug = `${category.slug}-ruyasi-${i + 1}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const content = `${title} hakkında detaylı rüya tabirleri ve anlamlar.\n\n${templateText}\n\nBu rüya, bilinçaltınızın önemli mesajlarını içerir. Rüya görme sırasında hissettiğiniz duygular ve bağlam, yorumlamada önemli rol oynar.`;
        const metaDesc = `${title.substring(0, 50)}... Rüya tabirleri ve anlamlar.`;
        const contentHash = crypto.createHash('md5').update(content).digest('hex');

        const wordCount = content.split(/\s+/).length;

        allRows.push({
          id,
          title,
          slug,
          content,
          categoryId: category.id,
          metaDesc,
          wordCount,
          contentHash,
        });
        id++;
      }
    }

    console.log(`✅ Prepared ${allRows.length} records`);
    console.log('💾 Inserting records in batches...\n');

    let totalInserted = 0;
    for (let start = 0; start < allRows.length; start += BATCH_SIZE) {
      const chunk = allRows.slice(start, start + BATCH_SIZE);
      const placeholders = [];
      const values = [];

      for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i];
        const base = i * 8;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, NOW(), NOW(), true, $${base + 6}, $${base + 7}, $${base + 8})`);
        values.push(
          row.id,
          row.title,
          row.slug,
          row.content,
          row.categoryId,
          row.metaDesc,
          row.wordCount,
          row.contentHash
        );
      }

      const insertQuery = `
        INSERT INTO dreams
        (id, title, slug, content, category_id, created_at, updated_at, is_published, meta_description, word_count, content_hash)
        VALUES ${placeholders.join(', ')}
      `;

      await conn.query(insertQuery, values);
      totalInserted += chunk.length;

      if (totalInserted % 5000 === 0 || totalInserted === allRows.length) {
        process.stdout.write(`\r✅ Generated ${totalInserted}/${TARGET_COUNT} dreams...`);
      }
    }

    console.log(`\n\n✨ Generation complete: ${totalInserted} dreams created\n`);

    // Verify
    console.log('🔍 Verification...');
    const countRes = await conn.query('SELECT COUNT(*) as count FROM dreams');
    const finalCount = parseInt(countRes.rows[0].count);
    console.log(`✅ Neon now has ${finalCount} dreams\n`);

    // Sample UTF-8 check
    const sampleRes = await conn.query('SELECT title FROM dreams LIMIT 5');
    console.log('📝 Sample dreams (UTF-8 encoding check):');
    sampleRes.rows.forEach(r => {
      const isClean = !r.title.includes('├') && !r.title.includes('─');
      const status = isClean ? '✅' : '❌';
      console.log(`${status} ${r.title.substring(0, 60)}`);
    });

    console.log('\n✨ ✨ ✨ GENERATION SUCCESSFUL! ✨ ✨ ✨');

  } catch (e) {
    console.error('\n❌ ERROR:', e.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await neonPool.end();
  }
}

generateAllDreams();
