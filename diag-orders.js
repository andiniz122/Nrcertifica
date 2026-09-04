require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const idStr = '6a9977eeae2ba476dd26fff7';
  let idObj = null;
  try { idObj = new mongoose.Types.ObjectId(idStr); } catch (e) {}

  const vals = idObj ? [idStr, idObj] : [idStr];
  const q = { $or: [
    { userId:  { $in: vals } }, { usuarioId: { $in: vals } },
    { user:    { $in: vals } }, { usuario:   { $in: vals } },
    { aluno:   { $in: vals } }, { alunoId:   { $in: vals } }
  ]};

  const orders = await db.collection('orders').find(q).toArray();
  console.log('=== orders do aluno (' + orders.length + ') ===');
  console.log(JSON.stringify(orders, null, 2));

  if (!orders.length) {
    console.log('\n=== ultimos 5 orders (para ver o formato) ===');
    console.log(JSON.stringify(
      await db.collection('orders').find({}).sort({ _id: -1 }).limit(5).toArray(), null, 2));
  }

  console.log('\n=== enrollments do aluno ===');
  console.log(JSON.stringify(
    await db.collection('enrollments').find(q).toArray(), null, 2));

  await mongoose.disconnect();
})();
