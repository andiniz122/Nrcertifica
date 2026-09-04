require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const cols = (await db.listCollections().toArray()).map(c => c.name);
  console.log('Colecoes:', cols.join(', '));

  const alvo = 'alexandrecarlodpc@gmail.com';
  for (const nome of cols) {
    const docs = await db.collection(nome).find({
      $or: [
        { email: alvo }, { 'aluno.email': alvo }, { 'usuario.email': alvo },
        { 'payer.email': alvo }, { 'comprador.email': alvo }
      ]
    }).toArray();
    if (docs.length) {
      console.log('\n=== ' + nome + ' (' + docs.length + ') ===');
      console.log(JSON.stringify(docs, null, 2));
    }
  }
  await mongoose.disconnect();
})();
