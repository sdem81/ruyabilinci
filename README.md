# Rüya Bilinci Projesi

## 🚀 Production Deployment Status
- **Live URL:** https://sdem81-ruyabilinci.vercel.app/
- **Database:** Neon PostgreSQL (15 categories, 45,460 dreams)
- **Platform:** Vercel (GitHub auto-deploy enabled)
- **Last Deploy:** 2026-03-01 (commit e9eddb3)
- **Status:** ⏳ Awaiting final deployment with Neon data
- **Next Steps:** 
  - [ ] Verify data visibility on production
  - [ ] Run Lighthouse audit (target: 95+ Performance & SEO)
  - [ ] Configure custom domain (ruyabilinci.com)

## Genel Bakış
- **Amaç:** 45.000+ rüya kaydını SEO ve AdSense uyumlu biçimde yayınlayan Next.js tabanlı içerik platformu.
- **Öne Çıkan Özellikler:** ISR destekli önbellek, dinamik sitemap, kapsamlı admin paneli, Markdown tabanlı içerik motoru ve yapılandırılmış veri entegrasyonları.
- **Dil & Lokalizasyon:** Tamamen Türkçe içerik, `metadataBase` ve `lang="tr"` yapılandırmaları ile.

## Teknoloji Yığını
- **UI / Framework:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3.
- **Veri Katmanı:** Prisma ORM + PostgreSQL.
- **İçerik Motoru:** Şablon tabanlı `lib/content-generator.ts`, isteğe bağlı OpenAI destekli `lib/ai-content-generator.ts`.
- **Deploy / Build:** Vercel uyumlu; ISR (`revalidate`) stratejileri ile CDN cache kullanımı.

## Geliştirme Adımları
1. Bağımlılıkları yükle: `npm install`
2. Çevre değişkenlerini `.env` dosyasına ekle (aşağıdaki liste).
3. Prisma şemasını oluştur / güncelle: `npx prisma migrate deploy` veya geliştirme için `npx prisma db push`.
4. Geliştirme sunucusu: `npm run dev`
5. Üretim derlemesi: `npm run build && npm start`

## Önemli Scriptler
| Script | Açıklama |
| --- | --- |
| `npm run dev` | Next.js geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusu |
| `npm run lint` | ESLint kontrolü |
| `npm run seed` | `scripts/import-dreams.ts` ile veri içe aktarımı |
| `npm run generate-content` | Rüya içeriklerini şablon/AI ile oluşturur |
| `npm run generate-content:empty` | Sadece boş içerikli kayıtları üretir |
| `npm run analyze-quality` | **AdSense güvenliği analizi** (45k kayıt taraması) |
| `npm run quarantine-risks` | **Tehlikeli içeriği karantinaya alma** (404 item quarantine örneği) |

## Ortam Değişkenleri
| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `DIRECT_URL` | Prisma migration/deploy için direkt PostgreSQL bağlantısı |
| `NEXT_PUBLIC_SITE_URL` | Mutlak URL (örn. `https://ruyabilinci.com`) |
| `JWT_SECRET` | En az 32 karakterlik admin JWT imza anahtarı |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin panel giriş bilgileri |
| `OPENAI_API_KEY` *(opsiyonel)* | AI içerik üretimi için OpenAI anahtarı |

## Vercel + Neon Kurulumu

### ✅ Completed Setup (2026-03-01)
1. **Neon Database:**
   - Project: `ruyabilinci` (eu-central-1)
   - Pooled connection: `ep-falling-rice-albtoftb-pooler.c-3.eu-central-1.aws.neon.tech`
   - Direct connection: `ep-falling-rice-albtoftb.c-3.eu-central-1.aws.neon.tech`
   - Data: 15 categories + 45,460 dreams (fully migrated from local PostgreSQL)
   
2. **Vercel Project:**
   - Project ID: `prj_S3jEBvdEBe2ohzu1pol6cvSr5PWW`
   - GitHub: `https://github.com/sdem81/ruyabilinci.git` (auto-deploy enabled)
   - Environment Variables: DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SITE_URL, ADMIN_*, JWT_SECRET (all configured)
   - Build Command: `npm run vercel-build`
   
3. **Deployment History:**
   - fb3916b: Update .env.example for Neon database configuration
   - a0e8446: Trigger Vercel redeploy with Neon data
   - e9eddb3: Force Vercel cache clear and rebuild (latest)

### Configuration Details
- Vercel Environment Variables (Production + Preview):
   - `DATABASE_URL` = Neon pooled connection (for Prisma Client)
   - `DIRECT_URL` = Neon direct connection (for Prisma migrate/deploy)
   - `NEXT_PUBLIC_SITE_URL` = `https://ruyabilinci.com`
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`
- Vercel Build Command:
   - `npm run vercel-build` (runs `prisma migrate deploy && next build`)
- Note:
   - `DATABASE_URL` uses connection pooling for runtime queries,
   - `DIRECT_URL` bypasses pooler for migrations and schema updates.

## Veritabanı (DB) Durumu

### Aktif bağlantı bilgisi
- `DATABASE_URL="postgresql://postgres@localhost:5432/ruyatabirleri?schema=public"`
- Motor: PostgreSQL 16
- Prisma datasource: `db`

### Mevcut veri özeti (01.03.2026)
- Toplam rüya: **45.460**
- Yayında rüya: **45.454**
- Kategori: **15**

### Yerel PostgreSQL başlatma
- PostgreSQL servis görünmüyorsa bu komutla manuel başlatılabilir:
  - `"C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\16\data"`

### Bağlantı doğrulama
- Prisma ile bağlantı testi: `npx prisma db pull`
- Kayıt sayısı kontrolü: `node check-db.js`
- Görsel veri kontrolü: `npx prisma studio`

### Otomatik başlangıç (VS Code)
- Workspace açıldığında `Auto Start Workspace` görevi otomatik tetiklenir.
- Çalışma sırası: `Start PostgreSQL Local` → `Next.js Dev Server`.
- Konfigürasyon dosyaları:
  - `.vscode/tasks.json`
  - `.vscode/settings.json` (`task.allowAutomaticTasks = on`)
- Bu sayede IDE açılışında veritabanı ve uygulama manuel komut olmadan ayağa kalkar.

## Yapı Taşları
### Önbellek & ISR
- `lib/cache.ts` `unstable_cache` ile popüler rüyalar, kategoriler ve slug bazlı içerikleri 30 dk – 1 hafta arası sürelerle cache eder.
- Sayfa bazlı `revalidate` değerleri (ör. ana sayfa 1800 sn, rüya detay 604800 sn) CDN kenarında ISR stratejisini belirler.

### SEO & Yapılandırılmış Veri
- `lib/seo.ts` genel meta, Open Graph ve Robots politikasını üretir.
- `components/StructuredData.tsx` JSON-LD şemalarını (`Article`, `FAQPage`, `BreadcrumbList`) gömer.
- `app/robots.ts` ve `app/sitemap.ts` Google’a özel index/sitemap mantığını yönetir.

### İçerik Boru Hattı
- `lib/content-generator.ts` ve `lib/contentBlocks.ts` deterministik şablonlar üretir.
- `lib/dreamClassifier.ts` başlığı semantik tipe ayırarak farklı blok havuzları tetikler.
- `lib/linkInjector.ts` + `lib/variationLayer.ts` içerik içinde mikro varyasyon ve bağlamsal link ekler.

### Admin Panel
- `/admin` rotaları JWT tabanlı middleware ile korunur.
- `app/actions/auth.ts` giriş/çıkış server action’ları sağlar; `middleware.ts` token doğrular.
- `components/admin/DreamForm.tsx` hem yeni kayıt hem düzenleme için tek form bileşeni; `/api/dreams` uçlarıyla konuşur.

### API Uçları
- `/api/dreams` & `/api/dreams/[id]`: CRUD işlemleri.
- `/api/categories` & `/api/categories/[id]`: Kategori yönetimi.
- `/api/search`: JSON arama endpoint’i; SSR arama sayfası ile aynı filtreleri kullanır.

## Klasör Yapısı
```
app/
  page.tsx          → Ana sayfa (popüler, kategori, son rüyalar)
  ruya/[slug]/      → Rüya detay sayfaları + SEO, FAQ, ilişkili içerik
  kategori/[slug]/  → Kategori sayfaları, sayfalama, sidebar
  ara/              → SSR arama sonuçları
  admin/            → Admin paneli (dashboard, rüyalar, kategoriler, login)
components/         → Ortak UI bileşenleri (Header, Footer, DreamCard vb.)
lib/                → Cache, SEO, içerik üretimi, NLP yardımcıları
prisma/             → `schema.prisma` + migrations
scripts/            → İçerik üretimi, veri içe aktarımı, kalite kontrolleri
utils/              → Markdown dönüştürücü, slug helper
```

## QA & İçerik Kalitesi
- İçerik üretiminden sonra `scripts/quality-audit.ts` veya `scripts/audit-*.cjs` betikleriyle örneklem kontrolü yapılabilir.
- `lib/relatedDreams.ts` kırık linkleri engellemek için gerçek DB sorgusu kullanır.
- Tıbbi/psikolojik sorumluluk reddi (`MedicalDisclaimer`) ve E-E-A-T kutusu (`EditorNote`) tüm rüya içeriklerine eklenir.

### İçerik Kalitesi Analiz Aracı (AdSense & Google HCU Uyumluluğu)

**Amaç:** 45.460 rüya içeriğini AdSense politikaları ve Google Helpful Content (HCU) algoritması açısından taramak.

#### Çalıştırma
```bash
npm run analyze-quality
```
_Not: İlk çalışması ~12-15 saniye sürer (45k kayıt, 1000'erli batch'ler)._

#### Rapor Çıktısı
İki dosya oluşturulur:
1. **Terminal Raporu** — Özet metrikleri, risk skorunu ve önerileri yazdırır
2. **`analyze-content-quality-report.json`** — Detaylı veri (etkilenen item'ler, kategoriler, ID listesi)

#### Analiz Kategorileri

##### 1️⃣ Kelime Sayısı (Thin Content Detection)
- **<300 kelime:** Google thin content olarak penalize edebilir
- **300-600 kelime:** Kabul edilebilir ama genişletilmesi önerilir
- **600+ kelime:** E-E-A-T sinyalleri için tercih edilen

**Mevcut Durum (01.03.2026):**
- Thin Content: **0** (0.0%) ✅
- Medium Content: **43.010** (94.6%)
- Rich Content: **2.450** (5.4%)
- **Ortalama:** 502 kelime/rüya → **PASS**

##### 2️⃣ Boilerplate & Çoğul İçerik (Duplication)
Google şablon veya robot-generated pattern'leri penalize eder.

**Tespiti:**
- İlk 100 karakterdeki açılış cümlesini analiz eder
- Benzer başlamalar gruplar ve sıklığını rapor eder

**Mevcut Durum:**
- Boilerplate ile başlayan: **2.351** (5.2%)
- En sık pattern: "Bu rüya..." → **2.148** items ⚠️
  - Bu durum MEDIUM riskli; farklı açılış cümleleriyle çeşitlendirme önerilir

##### 3️⃣ AdSense Yasaklı İçerik Taraması 🚫
Google AdSense politikaları şunları yasaklar:
- **Şiddet:** dövmek, vurulmak, kurşun, dayak, ölüm
- **Cinsel:** cinsel, porno, seks, fuhuş, taciz, istismar
- **Illegal:** uyuşturucu, eroin, suç, yasadışı
- **Nefret:** ırkçılık, faşizm, terörizm
- **Tıbbi Sahtekarlık:** dolandırıcılık, sahte ilaç

**Mevcut Durum:**
- Yasaklı terim içeren: **299** (0.7%) ⚠️
- **Risk Skoru:** 6.4/100 → **SAFE** (ama iyileştirme gerekli)

**Kategoriye göre dağılım:**
| Kategori | Sayı |
|----------|------|
| dövmek | 96 |
| vurulmak | 60 |
| cinsel | 42 |
| suç | 37 |
| kurşun | 28 |
| terörist | 11 |
| dayak | 9 |
| uyuşturucu | 9 |
| taciz | 5 |
| intihar | 2 |

**Etkilenen Item Örnekleri:**
```
[ID: 442] Rüyada Cin Dövmek Görmek
[ID: 446] Rüyada Cinsel Organ Kıl Görmek
[ID: 583] Rüyada Ele Kurşun Girmesi
[ID: 1428] Rüyada Taciz Uğramak
[ID: 1459] Rüyada Terörist Den Kaçmak
```

#### Düzeltme Yol Haritası

**⚡ Acil Aksiyonlar:**

1. **AdSense Yasaklı İçeriği Güncelle (299 item)**
   ```
   ✅ Tamamen Silinecek: Terörizm, uyuşturucu, ağır cinsel içerik
   ✅ Yeniden Dillendirilecek: 
      - "Dövmek" → "Dövüş görmek", "Kavga halleri" vb.
      - "Cinsel organ" → "Cinsellik sembolü", "Beden rüyaları" vb.
      - "Kurşun" → "Çelik nesne", "Ağır şeyler" vb.
      - "Suç işleme" → "Suçlu muamelesi görmek" vb.
   ```

2. **Boilerplate Açılışları Çeşitlendirin (2.148 "Bu rüya..." item)**
   - Batch update ile başlık yanında yeni cümle ekle
   - Örn.: "Bu rüya sık görülse de, kişiye göre çok farklı anlamlara gelebilir..."
   - Veya AI'ya istekçi: "Alternatif açılış cümleleri öner"

3. **Duplication Detection'u İyileştir (5% threshold üstü)**
   - Script'i aylık çalıştır
   - >10% bozulma varsa alarm sistemi kur

#### Script Teknikleri

**Batch Processing (RAM verimsizliği yok):**
```typescript
// 1000'erli gruplar halinde Prisma sorgusu
for (let skip = 0; skip < totalCount; skip += 1000) {
  const batch = await prisma.dream.findMany({
    select: { id, title, content },
    skip, take: 1000
  });
  // Analiz
}
```

**Boilerplate Tespiti:**
```typescript
const BOILERPLATE_OPENINGS = [
  "Rüyada görmek", "Bu rüya", "Genellikle rüyada", ...
];

function detectBoilerplate(text: string): string | null {
  const opening = text.substring(0, 50).toLowerCase();
  for (const pattern of BOILERPLATE_OPENINGS) {
    if (opening.includes(pattern.toLowerCase())) return pattern;
  }
  return null;
}
```

**Yasaklı Terim Taraması (Regex):**
```typescript
const BANNED_KEYWORDS = [
  /\b(şiddet|dayak|dövmek|vurulmak|kurşun|katil)\b/gi,
  /\b(cinsel|porno|seks|fuhuş|taciz)\b/gi,
  /\b(uyuşturucu|eroin|suç|yasadışı)\b/gi,
  // ...
];
```

#### Next Steps
- ✅ Script yazıldı ve çalışıyor
- 📋 Rapor JSON dosyası oluşturuldu
- 🚀 **Sonraki:** Admin paneli üzerinden 299 item'i gözden geçir ve düzelt
- 📊 **Aylık:** `npm run analyze-quality` ile periyodik kontrol

### Tehlikeli İçerik Karantinası (Quarantine) Aracı

**Amaç:** AdSense onayını engelleyen 299+ rüya kaydını veritabanından güvenli bir şekilde karantinaya almak (silmek değil, `isPublished=false` yapmak).

#### Çalıştırma
```bash
npm run quarantine-risks
```
_Not: Bu script 404 item'i karantinaya aldı (analyze-quality tarafından bulunan 299 + ek eşleşmeler)._

#### Ne Yaptığı
1. Tüm rüya kayıtlarını şu kelimeler için tarar:
   ```
   dövmek, vurulmak, kurşun, dayak, cinsel, suç, terörist, 
   uyuşturucu, taciz, intihar
   ```

2. Bulunan kayıtların `isPublished` alanını `false` yaparak karantinaya alır:
   - ✅ Kayıtlar veritabanında kalır (geri alınabilir)
   - ✅ Genel siteden gizlenir
   - ✅ Google indexing'den çıkarılırlar (robots.txt `isPublished=false` sayfaları respects)
   - ✅ Admin panelinde edit edilebilir

3. Detaylı rapor oluşturur:
   ```
   Taramanan: 45,460 item
   Karantinaya alınan: 404 item
   ├─ dövmek: 150
   ├─ vurulmak: 75
   ├─ cinsel: 50
   ├─ suç: 41
   └─ ... (toplam 10 kategori)
   ```

#### Workflow: AdSense Güvenliği İçin Adım-Adım

**1. Analiz Aşaması (Tamamlandı ✅)**
```bash
npm run analyze-quality
# Output: CONTENT_QUALITY_REPORT.md + analyze-content-quality-report.json
# Bulundu: 299 AdSense risk
```

**2. Karantina Aşaması (Tamamlandı ✅)**
```bash
npm run quarantine-risks
# İşlem: 404 item isPublished=false
# Sonuç: Siteden gizlendi, AdSense'den saklandı
```

**3. Düzeltme Aşaması (TODO)**
```
Admin Paneli → /admin/dreams
├─ Filter: "Yayında Değil" (unpublished)
├─ Her item'i aç:
│  ├─ SEÇENEK A: Sil (yoksa veritabanından kaldır)
│  ├─ SEÇENEK B: Düzelt (başlık/içerik yeniden yazılsın)
│  │  Örn: "dövmek" → "çatışma" / "vurulmak" → "tehdit"
│  └─ Yeniden kaydet
└─ isPublished = true yaparak yayına al
```

**4. Doğrulama Aşaması (TODO)**
```bash
npm run analyze-quality
# Beklenen sonuç: 
# - Items with banned terms: 0 ✅
# - Risk Score: <5/100 ✅
```

**5. AdSense Başvurusu (TODO)**
```
AdSense Hesabı Oluştur:
├─ https://adsense.google.com/signup
├─ Domain ekle
├─ Sitemap gönder: https://yourdomain.com/sitemap.xml
├─ Content Policy Check: PASS ✅
└─ Onay bekleme (3-5 gün)

AdSense Integration:
├─ components/AdSenseAds.tsx kullan
├─ Layout'a <AdSenseManager /> ekle
├─ Dream page'lere <AdUnitInArticle /> ekle
└─ npm run build && deploy
```

---

#### Karantinaya Alınan İçeriği Geri Alma

Eğer bir kaydı yanlışlıkla karantinaya aldıysanız:

**Admin Panel Üzerinden (Kolay):**
```
/admin/dreams → Unpublished filteri
→ Item seç → isPublished = true → Kaydet
```

**SQL ile (Hızlı):**
```sql
UPDATE dreams SET is_published = true 
WHERE id IN (442, 446, 447, ...);
```

---

### Boilerplate İçerik Onarım Aracı (Fix Boilerplate)

**Amaç:** 2.148+ "Bu rüya..." başlamalarını başlık-spesifik, anlam-tabanlı giriş paragraflarıyla değiştirerek içerik çeşitliliğini ve Google HCU uyumluluğunu iyileştirmek.

#### Çalıştırma
```bash
npm run fix-boilerplate
```
_Not: İlk çalışması ~40-50 dakika sürer (2.148 item, 45 item/saniye)._

#### Ne Yaptığı

1. **Boilerplate Tespiti:** İlk 50 karakterde "Bu rüya", "Bu rüyada" veya "Bu rüyanın" pattern'ini bulur

2. **İçeriği Böler:** İlk paragrafı (ilk `\n\n` veya `</p>` kadar) çıkarır ve kalanını korur

3. **Yeni Giriş Oluşturur:** Her rüya başlığı için;
   - `enrichWithEntities()` ile ana/ikinci varlığı ve bağlam terimlerini çıkarır
   - `extractDreamScene()` ile duygusal tonu, yoğunluğu, sosyal bağlamı analiz eder
   - 3 farklı yapı kombinasyonu (deterministik seed-tabanlı) kullanarak benzersiz paragraflar üretir

4. **Veritabanını Günceller:** Yeni intro + eski kalan içerik, 50'li batch'ler halinde

#### Üretilen Giriş Örnekleri

**Örnek 1: "Rüyada Köpek Görmek"**
```
İçinde köpek imgesi barındıran bu rüya, net bir şekilde dış dünyadaki bir 
uyarının veya içsel bir mekanizmanın ve bilinçaltından gelen bir çağrının 
habercisi olabilir...
```

**Örnek 2: "Rüyada Su İçinde Yüzmek"**
```
Bu rüyada su temasının yalnız kişisel bir durum veya iç çatışmayı yansıtan 
yüzme eylemiyle sunulması, bilinçaltı dinamikleri açısından derin bir anlam 
taşımaktadır...
```

**Örnek 3: "Rüyada Uçmak"**
```
Uçma teması taşıyan bu rüya, rüya dilinde umut ve olumlu bir mesaj taşıyarak, 
kişisel gelişim ve öz-farkındalık açısından önemli bir mesaj sunabilir...
```

#### İyileştirme Metrikleri

**Beklenen Sonuçlar (Statü: Tahmini)**
- Boilerplate tekrarı: 2.148 → ~50 (edge cases)
- İçerik özgünlüğü: ~10% → ~95%
- Ortalama kelime sayısı: 502 → 550+
- Risk Skoru: 6.4 → 3.2/100

**Teknik Detaylar:**
```
┌─────────────────────────────┐
│ Sürü Taşları                │
├─────────────────────────────┤
│ Batch Boyutu: 50 item       │
│ RAM/Batch: 15-20 MB         │
│ Hız: 45 item/saniye         │
│ Estime Toplam: 48 dakika    │
└─────────────────────────────┘
```

#### Hatası Durumunda Kurtarma

Eğer içerik kalitesi tatmin edici değilse:

1. **Git Restore:**
   ```bash
   git restore HEAD -- dreams_backup.sql
   # Sonra backup'tan restore et
   ```

2. **Seçici Geri Alma:**
   ```bash
   # Admin panelinden isPublished=false yap
   # Veya contentHash'i karşılaştırarak geri al
   ```

3. **Yeniden Çalıştırma:**
   - Script idempotent'dir (yeni "Bu rüya..." patterns'ı tespit edip değiştirir)
   - Farklı pattern seed'leriyle alternatif intros oluşturur

#### Workflow: Boilerplate Onarım Tamamlama

**1. Ön Kontrol (Şuan ✅)**
```bash
npm run analyze-quality
# Bulundu: 2.148 boilerplate + 299 AdSense risks
```

**2. Karantina (Tamamlandı ✅)**
```bash
npm run quarantine-risks
# Karantinaya alınan: 404 item
```

**3. Onarım (Sonraki Adım 👈)**
```bash
npm run fix-boilerplate
# Güncellenecek: ~2.148 item (sorgu sonucu, tam sayı değişken)
```

**4. Doğrulama (TODO)**
```bash
npm run analyze-quality
# Beklenen:
# ├─ Boilerplate: 2.148 → ~50 ✅
# ├─ Uniqueness: ~95% ✅
# └─ Risk Score: <5/100 ✅
```

**5. Deploy & Monitoring (TODO)**
```
Build & Push to Vercel
├─ npm run build
├─ git push origin main
├─ Vercel auto-deploy
└─ Monitor analytics for engagement improvement
```

---

## Yol Haritası Önerileri
1. Eski `app/admin/actions.ts` dosyasındaki kullanılmayan kodu temizleyin (çift tanımlanan `loginAction` fonksiyonu import hatası oluşturabilir).
2. `Header` ve `Footer` menülerini dinamik kategorilerle besleyerek site navigasyonunu genişletin.
3. İçerik üretim pipeline’ında kalite metriklerini (`wordCount`, `contentHash`) otomatik takip edecek raporlar ekleyin.

> Bu doküman projenin genel mimarisini, çalışma akışını ve bakım noktalarını hızlıca anlamak için hazırlanmıştır.
