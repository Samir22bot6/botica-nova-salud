const mongoose = require('mongoose');
const dns = require('dns');

// Configuración de DNS público para garantizar resolución exitosa de registros SRV de MongoDB Atlas en Windows/Node.js
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // En caso de que el entorno no permita cambiar servidores DNS
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB Atlas] Conexión exitosa: ${conn.connection.host} / BD: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Atlas] Error de conexión: ${error.message}`);
  }
};

module.exports = connectDB;

