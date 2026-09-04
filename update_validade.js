const fs=require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const i=l.indexOf('='); if(i>0 && !l.startsWith('#')) process.env[l.slice(0,i).trim()]=l.slice(i+1).trim();
});
const mongoose=require('mongoose');
(async()=>{
  await mongoose.connect(process.env.MONGODB_URI);
  const db=mongoose.connection.db;
  const r1=await db.collection('courses').updateOne({slug:'nr06'},
    {$set:{validade_anos:0,validade_texto:"Treinamento de capacitação quanto ao uso, guarda e conservação de EPI. A NR-06 não estabelece periodicidade fixa de reciclagem: novo treinamento é exigido sempre que houver alteração do EPI utilizado, mudança nas condições de risco da atividade ou constatação de uso inadequado pelo trabalhador."}});
  const r2=await db.collection('courses').updateOne({slug:'nr12-basico'},
    {$set:{validade_anos:0,validade_texto:"Capacitação exigida previamente ao exercício da função. A NR-12 não estabelece periodicidade fixa de reciclagem: nova capacitação é exigida na mudança de função ou de máquina, na modificação significativa da máquina ou do procedimento de trabalho, e após evento que evidencie a necessidade de nova capacitação."}});
  console.log('nr06:',r1.modifiedCount,'| nr12-basico:',r2.modifiedCount);
  const cs=await db.collection('courses').find({},{projection:{slug:1,validade_anos:1,validade_texto:1}}).toArray();
  cs.forEach(c=>console.log(c.slug.padEnd(24), String(c.validade_anos).padEnd(3), (c.validade_texto||'-').slice(0,60)));
  await mongoose.disconnect();
})();
