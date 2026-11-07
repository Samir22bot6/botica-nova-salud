const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

/**
 * CAPA 1: Helmet - Protección de cabeceras HTTP
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Permite compatibilidad con assets y APIs en entornos dev/prod
  crossOriginEmbedderPolicy: false,
});

/**
 * CAPA 2: CORS - Restricción de peticiones al origen del cliente frontend
 */
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Permite peticiones sin origin (como Postman, apps móviles o herramientas locales)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado: El origen ${origin} no está autorizado.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

/**
 * CAPA 3: Rate Limiting - Mitigación de abusos y ataques de fuerza bruta / DDoS
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 300, // Límite de peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP. Por favor intente más tarde.',
  },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30, // 30 intentos por 10 min en rutas de login/registro
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intente en 10 minutos.',
  },
});

/**
 * CAPA 4: HTTPS - Redirección forzada a HTTPS en producción
 */
const httpsRedirectMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Verificación de cabeceras de proxy inverso (Nginx, Heroku, Render, AWS ALB, etc.)
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
};

/**
 * CAPA 5: Logs - Auditoría de transacciones con Morgan
 */
// Formato personalizado para registrar método, url, estado, tiempo de respuesta e IP
const morganAuditMiddleware = morgan(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms'
);

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  authLimiter,
  httpsRedirectMiddleware,
  morganAuditMiddleware,
};

