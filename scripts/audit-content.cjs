const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.dream.findMany({ 
  take: 6, 
  select: { id:true, title:true, content:true, metaDescription:true, wordCount:true, category:{ select:{name:true} } }, 
  orderBy:{id:'asc'}
}).then(rows => {
  rows.forEach(r => {
    console.log('\n=== ID:'+r.id+' | '+r.title+' ===');
    console.log('META('+r.metaDescription?.length+'):', r.metaDescription);
    console.log('WORDS:', r.wordCount);
    console.log('CATEGORY:', r.category?.name);
    console.log('CONTENT(chars:'+r.content?.length+'):\n'+r.content?.substring(0,2000));
    console.log('---END---');
  });
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
