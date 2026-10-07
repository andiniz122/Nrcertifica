const fs = require('fs');
const mongoose = require('mongoose');

const env = fs.readFileSync(__dirname + '/.env.local', 'utf8');
const m = env.match(/(mongodb(\+srv)?:\/\/[^"'\s]+)/);
if (!m) { console.error('URI do MongoDB não encontrada'); process.exit(1); }
const URI = m[1];

const fmt = d => d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function datas(o, p = '', out = []) {
  if (!o || typeof o !== 'object') return out;
  for (const [k, v] of Object.entries(o)) {
    const c = p ? p + '.' + k : k;
    if (v instanceof Date) out.push({ campo: c, data: v });
    else if (Array.isArray(v)) v.forEach((x, i) => datas(x, c + '[' + i + ']', out));
    else if (v && typeof v === 'object' && v._bsontype !== 'ObjectId') datas(v, c, out);
  }
  return out;
}

function rot(d) {
  for (const c of ['curso','course','courseId','cursoId','titulo','title','nr','slug','codigo'])
    if (d[c] != null) return c + '=' + d[c];
  return '_id=' + d._id;
}

(async () => {
  const emails = process.argv.slice(2).map(e => e.toLowerCase().trim());
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  const cols = (await db.listCollections().toArray()).map(c => c.name);
  console.log('Coleções:', cols.join(', '), '\n');

  for (const email of emails) {
    console.log('='.repeat(80) + '\nALUNO: ' + email);
    let user = null, colU = null;
    for (const c of cols) {
      const u = await db.collection(c).findOne({ email: { $regex: '^' + esc(email) + '$', $options: 'i' } });
      if (u) { user = u; colU = c; break; }
    }
    if (!user) { console.log('  não encontrado\n'); continue; }
    console.log('  _id: ' + user._id + ' (coleção ' + colU + ')');
    if (user.createdAt) console.log('  cadastro: ' + fmt(user.createdAt));

    const ev = [];
    for (const c of cols) {
      if (c === colU) continue;
      const a = await db.collection(c).findOne({});
      if (!a) continue;
      const refs = Object.keys(a).filter(k => /^(user|usuario|aluno|student)(Id|_id)?$/i.test(k));
      if (!refs.length) continue;
      const f = { $or: refs.flatMap(k => [{ [k]: user._id }, { [k]: String(user._id) }]) };
      for (const d of await db.collection(c).find(f).toArray())
        for (const { campo, data } of datas(d))
          ev.push({ data, txt: '[' + c + '] ' + rot(d) + ' -> ' + campo });
    }
    ev.sort((a, b) => a.data - b.data);
    ev.forEach(e => console.log('  ' + fmt(e.data) + '  ' + e.txt));
    if (ev.length > 1)
      console.log('\n  Janela total: ' + ((ev.at(-1).data - ev[0].data) / 36e5).toFixed(1) + ' h');
    console.log();
  }
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
