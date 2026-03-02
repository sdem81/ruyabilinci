import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Kirli başlıklar temizleniyor...");

  let page = 0;
  const PAGE_SIZE = 500;
  let totalFixed = 0;

  while (true) {
    const dreams = await prisma.dream.findMany({
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
      where: {
        title: { contains: ";" },
      },
      select: { id: true, title: true, slug: true },
    });

    if (dreams.length === 0) break;

    for (const dream of dreams) {
      const cleanTitle = dream.title.split(";")[0].trim();
      if (!cleanTitle || cleanTitle === dream.title) continue;

      await prisma.dream.update({
        where: { id: dream.id },
        data: {
          title: cleanTitle,
          content: `${cleanTitle} ne anlama gelir? ${cleanTitle} rüyası, rüya tabircilerine göre çeşitli anlamlar taşımaktadır. Bu rüyanın detaylı tabiri ve yorumu için sayfamızı inceleyebilirsiniz.`,
          shortSummary: `${cleanTitle} rüyasının anlamı ve tabiri.`,
        },
      });
      totalFixed++;
    }

    console.log(`İlerleme: ${totalFixed} başlık düzeltildi...`);
    page++;
  }

  console.log(`\nTamamlandı! Toplam ${totalFixed} başlık temizlendi.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
