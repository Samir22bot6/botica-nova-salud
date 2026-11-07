/**
 * Middleware para validar roles de usuario autorizados
 * Ejemplo de uso: checkRole('Admin') o checkRole('Admin', 'Farmacéutico')
 */
const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado en el sistema.',
      });
    }

    const rolUsuario = req.user.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        success: false,
        message: `Acceso restringido: Se requiere rol [${rolesPermitidos.join(', ')}]. Su rol actual es '${rolUsuario}'.`,
      });
    }

    next();
  };
};

module.exports = checkRole;
