const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const generateToken = (id, rol, nombre) => {
  return jwt.sign(
    { id, rol, nombre },
    process.env.JWT_SECRET || 'secreto_super_seguro_botica_2026',
    { expiresIn: '8h' }
  );
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese correo y contraseña.',
      });
    }

    const user = await Usuario.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    const token = generateToken(user._id, user.rol, user.nombre);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public / Admin
const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existingUser = await Usuario.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este correo electrónico.',
      });
    }

    const user = await Usuario.create({
      nombre,
      email,
      password,
      rol: rol || 'Cajero',
    });

    const token = generateToken(user._id, user.rol, user.nombre);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener usuario autenticado
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await Usuario.findById(req.user.id).select('-password');
    res.json({
      success: true,
      usuario: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
};

