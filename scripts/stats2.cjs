const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  const [s] = await p.$queryRaw`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE is_published=true) AS published,
      COUNT(*) FILTER (WHERE content IS NOT NULL AND content!='') AS with_content,
      ROUND(AVG(array_length(regexp_split_to_array(trim(content),E'\\s+'),1)) FILTER (WHERE content IS NOT NULL AND content!='')) AS avg_words,
      MIN(array_length(regexp_split_to_array(trim(content),E'\\s+'),1)) FILTER (WHERE content IS NOT NULL AND content!='') AS min_words,
      MAX(array_length(regexp_split_to_array(trim(content),E'\\s+'),1)) FILTER (WHERE content IS NOT NULL AND content!='') AS max_words
    FROM dreams`;
  const cats = await p.category.count();
  console.log("Toplam ruya     :", Number(s.total));
  console.log("Yayimlanan      :", Number(s.published));
  console.log("Icerigi olan    :", Number(s.with_content));
  console.log("Kategori        :", cats);
  console.log("Ort. kelime     :", Number(s.avg_words));
  console.log("Min kelime      :", Number(s.min_words));
  console.log("Maks kelime     :", Number(s.max_words));
}
main().catch(console.error).finally(()=>p.$disconnect());
