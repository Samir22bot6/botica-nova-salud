const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Se requiere token JWT.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_botica_2026');
    const user = await Usuario.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'El usuario ya no existe en el sistema.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado.',
      error: error.message,
    });
  }
};

// Middleware para autorizar roles específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol (${req.user ? req.user.rol : 'Sin rol'}) no tiene permisos para esta acción.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

