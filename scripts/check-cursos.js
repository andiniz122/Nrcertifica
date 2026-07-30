const fs = require('fs'), path = require('path'), mongoose = require('mongoose');
fs.readFileSync(path.join(__dirname,'..','.env.local'),'utf-8').split('\n').forEach(l=>{
  const m=l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/); if(m) process.env[m[1]]=(m[2]||'').replace(/^['"]|['"]$/g,'');
});
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const cursos = await db.collection('courses').find({}).sort({ preco: 1 }).toArray();
  console.log('');
  for (const c of cursos) {
    const mods = (c.modulos || []).length;
    const ex = (c.modulos || []).reduce((s, m) => s + ((m.exercicios || []).length), 0);
    const prova = (c.prova_final || c.prova || []).length || (c.prova_final?.questoes || []).length || 0;
    const mats = await db.collection('materials').countDocuments({ course_id: c._id });
    console.log(
      String(c.titulo || '?').slice(0, 38).padEnd(40) +
      '| ' + String(c.carga_horaria || '-').padEnd(5) +
      '| ativo:' + String(c.ativo).padEnd(6) +
      '| mods:' + String(mods).padEnd(3) +
      '| exerc:' + String(ex).padEnd(4) +
      '| prova:' + String(prova).padEnd(4) +
      '| apostilas:' + mats
    );
  }
  console.log('');
  await mongoose.disconnect();
})();
