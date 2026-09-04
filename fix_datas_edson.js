const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
const {ObjectId}=require('mongodb');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  const ini=new Date('2026-08-25T12:00:00Z');
  const fim=new Date('2026-08-31T12:00:00Z');
  const c=await db.collection('certificates').updateOne({codigo:'07C27522'},
    {$set:{'dados.data_inicio':ini,'dados.data_conclusao':fim}});
  const e=await db.collection('enrollments').updateOne({_id:new ObjectId('6a95877b596c535b8c5b8e11')},
    {$set:{data_inicio_curso:ini,data_fim_curso:fim}});
  console.log('cert:',c.modifiedCount,'| enrollment:',e.modifiedCount);
  const d=(await db.collection('certificates').findOne({codigo:'07C27522'})).dados;
  console.log('inicio:',d.data_inicio,'\nfim:',d.data_conclusao);
  await mongoose.disconnect();
})();
