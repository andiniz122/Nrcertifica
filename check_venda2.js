const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
const {ObjectId}=require('mongodb');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  const uid=new ObjectId('6a95862f596c535b8c5b8df1');

  console.log('=== ORDER ===');
  console.log(JSON.stringify(await db.collection('orders').findOne({_id:new ObjectId('6a958736596c535b8c5b8df8')}),null,2));

  console.log('\n=== ENROLLMENTS DO ALUNO ===');
  const ens=await db.collection('enrollments').find({$or:[{usuario:uid},{user:uid},{aluno:uid},{userId:uid}]}).toArray();
  console.log(JSON.stringify(ens,null,2));

  console.log('\n=== ULTIMOS 3 ENROLLMENTS (geral) ===');
  console.log(JSON.stringify(await db.collection('enrollments').find({}).sort({_id:-1}).limit(3).toArray(),null,2));

  console.log('\n=== CERTIFICATES ===');
  console.log(JSON.stringify(await db.collection('certificates').find({}).sort({_id:-1}).limit(3).toArray(),null,2));

  await mongoose.disconnect();
})();
