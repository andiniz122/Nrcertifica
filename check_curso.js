const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })
;(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const c = await mongoose.connection.db.collection('courses')
    .findOne({ slug: /comandos/ }, { projection: { slug:1, titulo:1, ativo:1, 'modulos.id':1, 'modulos.titulo':1 } })
  console.log(JSON.stringify(c, null, 2))
  await mongoose.disconnect()
})()
