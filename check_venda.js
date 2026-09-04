const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  console.log('=== COLLECTIONS ===');
  console.log((await db.listCollections().toArray()).map(c=>c.name).join(', '));
  console.log('\n=== PEDIDO ===');
  const {ObjectId}=require('mongodb');
  console.log(JSON.stringify(await db.collection('pedidos').findOne({_id:new ObjectId('6a958736596c535b8c5b8df8')}),null,2));
  console.log('\n=== USER ===');
  const u=await db.collection('users').findOne({email:/edsonjrtecnico/i});
  console.log(JSON.stringify(u,null,2));
  console.log('\n=== MATRICULAS ===');
  console.log(JSON.stringify(await db.collection('matriculas').find({}).sort({_id:-1}).limit(5).toArray(),null,2));
  await mongoose.disconnect();
})();
