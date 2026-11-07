const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware para verificar token JWT en peticiones protegidas
 * Formato esperado: Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token de autenticación.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_botica_2026');
    
    // Intenta buscar en base de datos; si está en modo memoria o no encuentra, usa datos del token
    let user = null;
    try {
      user = await Usuario.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignorar si BD está offline
    }

    if (!user) {
      // Fallback con datos decodificados del token (id, rol, nombre)
      user = {
        _id: decoded.id,
        nombre: decoded.nombre || 'Usuario Autenticado',
        email: decoded.email || '',
        rol: decoded.rol || 'Cajero',
      };
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido o expirado.',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
