require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
if (!uri) { console.error('URI nao encontrada no .env'); process.exit(1); }

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  console.log('=== DB ===', db.databaseName);

  const cols = (await db.listCollections().toArray()).map(c => c.name);
  console.log('=== COLLECTIONS ===', cols);

  const u = await db.collection('users').findOne({}, { projection: { senha: 0, password: 0 } });
  console.log('=== USER campos ===', u ? Object.keys(u) : 'vazio');

  const total = await db.collection('users').countDocuments({});
  const comTel = await db.collection('users').countDocuments({ telefone: { $exists: true, $ne: '' } });
  console.log(`=== telefone preenchido: ${comTel} de ${total}`);

  for (const c of cols.filter(n => /pedido|order|inscri|matric|pagamento|payment/i.test(n))) {
    const d = await db.collection(c).findOne({});
    if (d) console.log(`--- ${c}:`, Object.keys(d));
  }

  await client.close();
})().catch(e => { console.error(e.message); process.exit(1); });
