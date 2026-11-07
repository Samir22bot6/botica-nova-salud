const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Importación de las 5 Capas de Seguridad Middleware
const {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  httpsRedirectMiddleware,
  morganAuditMiddleware,
} = require('./middleware/security');

// Importación de Rutas
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const { sampleProductos, sampleUsuarios } = require('./utils/seeder');
const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');

// Inicialización de la aplicación Express
const app = express();

// ==========================================
// 5 CAPAS DE SEGURIDAD MIDDLEWARE EN EXPRESS
// ==========================================

// CAPA 4: Redirección forzada HTTPS (en entornos de producción o proxys)
app.use(httpsRedirectMiddleware);

// CAPA 1: Helmet - Protección de cabeceras HTTP (XSS, Sniffing, Clickjacking)
app.use(helmetMiddleware);

// CAPA 2: CORS - Restricción de peticiones únicamente al origen autorizado
app.use(corsMiddleware);

// CAPA 5: Logs - Registro y auditoría de transacciones con Morgan
app.use(morganAuditMiddleware);

// CAPA 3: Rate Limiting - Mitigación contra ataques de fuerza bruta y abusos
app.use('/api', apiLimiter);

// Parsers para el cuerpo de las peticiones
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexión a MongoDB Atlas
connectDB();

// Ruta de comprobación de salud y diagnóstico (Healthcheck)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    empresa: 'Botica Nova Salud (FarmaPlus)',
    estado: 'Servidor Operativo',
    entorno: process.env.NODE_ENV || 'development',
    seguridad: {
      capa1_helmet: 'Activo',
      capa2_cors: 'Activo',
      capa3_rateLimit: 'Activo',
      capa4_httpsRedirect: 'Activo',
      capa5_morganAudit: 'Activo',
    },
    timestamp: new Date().toISOString(),
  });
});

// Endpoint utilitario para sembrar datos de prueba con 1 clic desde el Frontend
app.post('/api/seed', async (req, res, next) => {
  try {
    const totalProductos = await Producto.countDocuments();
    if (totalProductos === 0 || req.query.force === 'true') {
      await Producto.deleteMany({});
      await Usuario.deleteMany({});
      for (const u of sampleUsuarios) {
        await Usuario.create(u);
      }
      await Producto.insertMany(sampleProductos);
      return res.json({
        success: true,
        message: 'Base de datos inicializada exitosamente con medicamentos y usuarios de prueba.',
      });
    }
    res.json({
      success: true,
      message: `La base de datos ya cuenta con ${totalProductos} medicamentos registrados.`,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// REGISTRO DE RUTAS DE LA API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador centralizado de errores
app.use(errorHandler);

// Arranque del Servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`[Nova Salud Backend] Servidor escuchando en puerto ${PORT}`);
  console.log(`[Seguridad] 5 Capas de Middleware activas`);
  console.log(`[Frontend URL permitida] ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`====================================================`);
});

module.exports = { app, server };

