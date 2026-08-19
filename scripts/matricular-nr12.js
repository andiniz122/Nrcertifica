const fs = require('fs'), mongoose = require('mongoose');
fs.readFileSync('.env.local','utf-8').split('\n').forEach(l=>{
  const m=l.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/); if(m) process.env[m[1]]=(m[2]||'').replace(/^['"]|['"]$/g,'');
});
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'anderson@nrcertifica.com.br' });
  const course = await db.collection('courses').findOne({ slug: 'nr12-basico' });
  if (!user || !course) { console.log('usuario ou curso nao encontrado'); process.exit(1); }
  const jaMatriculado = await db.collection('enrollments').findOne({ usuario_id: user._id, course_id: course._id });
  if (jaMatriculado) { console.log('ja matriculado!'); process.exit(0); }
  await db.collection('enrollments').insertOne({
    usuario_id: user._id,
    course_id: course._id,
    status: 'ativo',
    progresso: 0,
    data_matricula: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('Matriculado com sucesso em', course.titulo);
  await mongoose.disconnect();
})();
