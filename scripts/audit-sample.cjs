const {PrismaClient}=require("@prisma/client");
const p=new PrismaClient();
p.dream.findMany({take:3, select:{title:true,slug:true,shortSummary:true,content:true}, orderBy:{id:"asc"}})
 .then(ds=>ds.forEach((d,i)=>{
   const wc=d.content?d.content.split(/\s+/).length:0;
   console.log(`\n========= ÖRNEK ${i+1} =========`);
   console.log("BAŞLIK:", d.title);
   console.log("KELIME:", wc);
   console.log("META (" + (d.shortSummary||"").length + " kar):", d.shortSummary);
   console.log("--- TAM İÇERİK ---");
   console.log(d.content);
 }))
 .finally(()=>p.$disconnect());
