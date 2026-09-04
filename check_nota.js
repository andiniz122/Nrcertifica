const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  console.log('=== CERT DO EDSON ===');
  const c=await db.collection('certificates').find({}).sort({_id:-1}).limit(2).toArray();
  console.log(JSON.stringify(c,null,2));
  console.log('\n=== ENROLLMENT COM TENTATIVAS ===');
  const e=await db.collection('enrollments').find({usuario_id:new (require('mongodb').ObjectId)('6a95862f596c535b8c5b8df1')}).toArray();
  console.log(JSON.stringify(e,null,2));
  await mongoose.disconnect();
})();
