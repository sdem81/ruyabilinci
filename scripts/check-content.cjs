const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.dream.findFirst({ select: { title: true, slug: true, shortSummary: true, content: true } })
  .then(d => {
    const wc = d.content ? d.content.split(/\s+/).length : 0;
    console.log('TITLE:', d.title);
    console.log('SLUG:', d.slug);
    console.log('KELIME SAYISI:', wc);
    console.log('KARAKTER:', d.content ? d.content.length : 0);
    console.log('META:', d.shortSummary?.substring(0, 120));
    console.log('---CONTENT (ilk 800 karakter)---');
    console.log(d.content?.substring(0, 800));
  })
  .finally(() => p.$disconnect());
