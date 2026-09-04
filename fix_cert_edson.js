const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  const r=await db.collection('certificates').updateOne({codigo:'07C27522'},
    {$set:{'dados.acertos':10,'dados.total':10,'dados.percentual':100}});
  console.log('atualizado:',r.modifiedCount);
  console.log(JSON.stringify((await db.collection('certificates').findOne({codigo:'07C27522'})).dados,null,2));
  await mongoose.disconnect();
})();
