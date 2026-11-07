const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const Usuario = require('./models/Usuario');

const seedAdmin = async () => {
  try {
    console.log('[seedAdmin] Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[seedAdmin] Conexión establecida.');

    // Verificar si ya existe el usuario administrador
    const adminExistente = await Usuario.findOne({ email: 'admin@novasalud.com' });

    if (adminExistente) {
      console.log(`[seedAdmin] El usuario Administrador ya existe: ${adminExistente.email} (Rol: ${adminExistente.rol})`);
    } else {
      console.log('[seedAdmin] Creando usuario Administrador por defecto...');
      const nuevoAdmin = await Usuario.create({
        nombre: 'Administrador Nova Salud',
        email: 'admin@novasalud.com',
        password: 'admin123',
        rol: 'Admin',
      });
      console.log(`[seedAdmin] Administrador creado exitosamente: ${nuevoAdmin.email} con contraseña 'admin123'`);
    }

    // Verificar si existe un cajero para pruebas
    const cajeroExistente = await Usuario.findOne({ email: 'caja@novasalud.com' });
    if (!cajeroExistente) {
      console.log('[seedAdmin] Creando usuario Cajero por defecto para pruebas...');
      await Usuario.create({
        nombre: 'Juan Pérez (Cajero)',
        email: 'caja@novasalud.com',
        password: 'caja123',
        rol: 'Cajero',
      });
      console.log('[seedAdmin] Cajero creado exitosamente: caja@novasalud.com');
    }

    console.log('[seedAdmin] Proceso finalizado.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[seedAdmin] Error al insertar usuario Administrador:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
