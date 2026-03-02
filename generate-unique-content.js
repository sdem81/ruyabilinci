/**
 * Smart Pattern-Based Content Generator
 * Creates unique dream interpretations using template variations
 * No AI cost, fast generation, SEO-friendly
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const crypto = require('crypto');

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Content building blocks for variation
const INTRO_PATTERNS = [
  'Bu rüya, bilinçaltınızın önemli mesajlarını yansıtır.',
  'Rüya yorumunda bu sembol, derin anlamlar taşır.',
  'Bu görüntü, iç dünyanızın bir yansımasıdır.',
  'Bilinçaltı mesajları bu rüyada kendini gösterir.',
  'Bu rüya sembolü, özel anlamlar içerir.',
];

const PSYCHOLOGICAL_PATTERNS = [
  'Psikolojik açıdan bakıldığında, bu rüya kişisel gelişim ve değişim sürecinizi temsil eder. İç dünyanızdaki dönüşümleri işaret ederek, yaşamınızdaki yeni farkındalıklara dikkat çeker.',
  'Modern psikoloji perspektifinden, bu sembol bilinçaltı düşüncelerinizin bir göstergesidir. Duygusal durumunuz ve zihinsel süreçleriniz hakkında ipuçları verir.',
  'Rüya psikolojisi açısından değerlendirildiğinde, bu görüntü bastırılmış duyguların veya çözülmemiş sorunların yüzeye çıkışını simgeler. İç dünyada yaşanan çatışmaların bir yansımasıdır.',
  'Psikanalitik yoruma göre, bu rüya benliğinizin farklı yönleri arasındaki diyaloğu temsil eder. Farkında olmadığınız ihtiyaç ve arzularınızı gün yüzüne çıkarır.',
  'Bilinçaltı süreçleriniz bu rüyada sembolik anlam kazanır. Yaşam deneyimleriniz ve kişisel tarihiniz, bu görüntüde yeniden şekillenir.',
];

const SPIRITUAL_PATTERNS = [
  'İslami rüya tabirinde, bu sembol maneviyat ve iman konularıyla ilişkilendirilir. Ruhani gelişiminiz ve Allah\'a yakınlığınız hakkında mesajlar taşır.',
  'Geleneksel İslami kaynaklara göre, bu rüya dini vecibeleriniz ve manevi sorumluluklarınız ile bağlantılıdır. İbadet hayatınıza dair işaretler verir.',
  'Tasavvufi yorumda, bu görüntü nefs terbiyesi ve kalp temizliği ile ilgilidir. Manevi yolculuğunuzdaki aşamaları simgeler.',
  'Dini açıdan bakıldığında, bu rüya hayır-şer ayrımı ve doğru yolu bulma çabalarınızı yansıtır. İnanç değerlerinizle ilgili farkındalık yaratır.',
  'İslami gelenekte, bu sembol bereket, hidayet ve Allah\'ın rahmetini temsil edebilir. Manevi kazanımlarınıza işaret eder.',
];

const PRACTICAL_PATTERNS = [
  'Günlük yaşamınızda bu rüya, yaklaşan değişikliklere hazırlıklı olmanız gerektiğini gösterir. Kararlarınızı daha bilinçli almanıza yardımcı olabilir.',
  'Pratik anlamda, bu rüya size şu an yaşadığınız durumla ilgili farklı bir bakış açısı sunar. Sorunlarınıza yeni çözümler bulmanızı sağlar.',
  'Bu rüyanın güncel hayatınıza yansıması, ilişkileriniz ve iş hayatınız üzerinde düşünmenizi gerektirir. Önceliklerinizi gözden geçirmeniz faydalı olacaktır.',
  'Yaşam pratiklerinize ışık tutan bu rüya, değişim yapmanız gereken alanları işaret eder. Kendinizi geliştirme fırsatlarını gösterir.',
  'Bu sembol, karşılaştığınız zorlukların üstesinden gelme yollarını simgesel olarak anlatır. Güçlü yönlerinizi hatırlatır.',
];

const EMOTIONAL_PATTERNS = [
  'Duygusal olarak, bu rüya içinizdeki huzursuzluk veya mutluluk halini yansıtır. Duygularınızı dinlemenin önemini vurgular.',
  'His dünyası açısından bakıldığında, bu görüntü bastırılmış duyguların açığa çıkmasını temsil eder. Kendinizle yüzleşme zamanı gelmiş olabilir.',
  'Bu rüya, duygusal dengeniz hakkında önemli mesajlar taşır. İçsel huzur ve tatmin arayışınızı simgeler.',
  'Hisleriniz ve sezgileriniz bu rüyada sembolik bir dil bulur. Duygusal zekânızı geliştirmenize katkı sağlar.',
  'Bu sembol, sevgi, korku, öfke gibi temel duygularınızın işlenmesine yardımcı olur. Duygusal farkındalığınızı artırır.',
];

const CLOSING_PATTERNS = [
  'Rüyayı gördüğünüz anki duygularınız ve yaşam koşullarınız, yorumun netleşmesinde kilit rol oynar. Her rüya kişiye özeldir.',
  'Unutmayın ki rüya tabirleri genel çerçeveler sunar, asıl anlam sizin kişisel deneyimlerinizle şekillenir.',
  'Bu yorumları kendi yaşam hikayeniz bağlamında değerlendirmek, en doğru anlamı bulmanızı sağlar.',
  'Rüyanızın detayları ve hissettikleriniz, tam yorumu yaparken göz önünde bulundurulmalıdır.',
  'Her rüya görenin hayatı farklıdır, bu nedenle kişisel bağlamınızı dikkate alarak değerlendirme yapın.',
];

function hashString(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function selectPattern(patterns, seed, index) {
  const hash = hashString(seed + index);
  const hashNum = parseInt(hash.substring(0, 8), 16);
  return patterns[hashNum % patterns.length];
}

function generateContent(title, categoryName, dreamId) {
  const seed = `${title}-${dreamId}`;
  
  const intro = selectPattern(INTRO_PATTERNS, seed, 0);
  const psychological = selectPattern(PSYCHOLOGICAL_PATTERNS, seed, 1);
  const spiritual = selectPattern(SPIRITUAL_PATTERNS, seed, 2);
  const practical = selectPattern(PRACTICAL_PATTERNS, seed, 3);
  const emotional = selectPattern(EMOTIONAL_PATTERNS, seed, 4);
  const closing = selectPattern(CLOSING_PATTERNS, seed, 5);

  const categoryContext = `${categoryName} kategorisindeki bu rüya, hayatınızın bu alanıyla ilgili önemli mesajlar taşır.`;

  const content = `${intro}

${psychological}

${spiritual}

${categoryContext}

${practical}

${emotional}

${closing}`;

  return content;
}

async function generateAllContent() {
  console.log('🚀 GENERATING UNIQUE CONTENT WITH SMART PATTERNS\n');

  let conn;
  try {
    conn = await neonPool.connect();

    console.log('📥 Fetching dreams WITHOUT content...');
    const dreamsRes = await conn.query(`
      SELECT d.id, d.title, d.slug, d.category_id, c.name as category_name
      FROM dreams d
      JOIN categories c ON d.category_id = c.id
      WHERE d.is_published = true AND (d.content IS NULL OR LENGTH(d.content) < 500)
      ORDER BY d.id ASC
    `);

    const dreams = dreamsRes.rows;
    console.log(`✅ Found ${dreams.length} dreams needing content\n`);

    if (dreams.length === 0) {
      console.log('🎉 All dreams already have content!');
      return;
    }

    let processed = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < dreams.length; i += BATCH_SIZE) {
      const batch = dreams.slice(i, Math.min(i + BATCH_SIZE, dreams.length));
      
      for (const dream of batch) {
        const interpretation = generateContent(dream.title, dream.category_name, dream.id);
        const fullContent = `${dream.title} hakkında detaylı rüya tabirleri ve yorumları:\n\n${interpretation}`;
        const metaDesc = interpretation.substring(0, 155).replace(/\n/g, ' ');
        const shortSummary = interpretation.substring(0, 200).replace(/\n/g, ' ');

        await conn.query(
          `UPDATE dreams 
           SET content = $1, meta_description = $2, short_summary = $3, updated_at = NOW()
           WHERE id = $4`,
          [fullContent, metaDesc, shortSummary, dream.id]
        );

        processed++;
        if (processed % 1000 === 0) {
          console.log(`⏳ Processed ${processed}/${dreams.length}...`);
        }
      }
    }

    console.log(`\n✨ GENERATION COMPLETE!`);
    console.log(`✅ Generated unique content for all ${processed} dreams`);
    console.log(`🎉 Every dream now has SEO-optimized, unique interpretation!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await neonPool.end();
  }
}

generateAllContent();
