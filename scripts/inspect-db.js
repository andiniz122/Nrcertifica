const fs = require('fs'), path = require('path'), mongoose = require('mongoose');
fs.readFileSync(path.join(__dirname,'..','.env.local'),'utf-8').split('\n').forEach(l=>{
  const m=l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/); if(m) process.env[m[1]]=(m[2]||'').replace(/^['"]|['"]$/g,'');
});
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('\n=== COLECOES ===');
  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    console.log(c.name.padEnd(25) + await db.collection(c.name).countDocuments());
  }

  console.log('\n=== ESTRUTURA DE UM CURSO ===');
  const curso = await db.collection('courses').findOne({ slug: 'nr35' });
  console.log(JSON.stringify(curso, null, 2).slice(0, 2500));

  await mongoose.disconnect();
})();
