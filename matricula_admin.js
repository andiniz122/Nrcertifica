require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = mongoose.connection.db.collection('users');
  const courses = mongoose.connection.db.collection('courses');
  const enrollments = mongoose.connection.db.collection('enrollments');

  const admin = await users.findOne({ email: 'anderson@nrcertifica.com.br' });
  const curso = await courses.findOne({ slug: 'nr10-basico' });

  if (!admin || !curso) {
    console.log('Nao encontrado - Admin:', admin, 'Curso:', curso);
    process.exit(1);
  }

  const jaExiste = await enrollments.findOne({
    usuario_id: admin._id,
    curso_id: curso._id
  });

  if (jaExiste) {
    console.log('Matricula ja existe!');
    process.exit(0);
  }

  await enrollments.insertOne({
    usuario_id: admin._id,
    curso_id: curso._id,
    order_id: new mongoose.Types.ObjectId(),
    status: 'ativo',
    modulos_concluidos: [],
    tentativas_prova: [],
    aprovado: false,
    criadoEm: new Date()
  });

  console.log('Matricula criada com sucesso!');
  process.exit(0);
});
