const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./users.js'); // ahora está en la misma carpeta models

async function createAdmin() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_TEST;
  if(!mongoUri){
    console.error('MONGO_URI o MONGO_URI_TEST no está definido en el .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }); // usa tu URI de Atlas

  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!email || !plainPassword) {
    console.error('ADMIN_EMAIL o ADMIN_PASSWORD no están definidos en el .env');
    process.exit(1);
  }

  try{
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    console.log('Hash generado para la contraseña:', passwordHash);

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('El usuario admin ya existe:', existing.email);
    } else {
      await User.create({
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'admin'
      });
      console.log('Usuario admin creado:', email);
    }
  }catch(err){
    console.error('Error creando usuario admin', err);
    process.exit(1);
  }finally{
    await mongoose.disconnect();
  }
}

createAdmin();
