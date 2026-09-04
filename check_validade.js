const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  const cs=await db.collection('courses').find({},{projection:{slug:1,titulo:1,validade_anos:1,carga_horaria:1,ativo:1}}).toArray();
  console.table(cs.map(c=>({slug:c.slug,validade_anos:c.validade_anos,ch:c.carga_horaria,ativo:c.ativo})));
  await mongoose.disconnect();
})();
