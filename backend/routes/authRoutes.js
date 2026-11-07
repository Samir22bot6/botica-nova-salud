const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

// Rutas de autenticación protegidas por limitador de tasa (Rate Limiting Capa 3)
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.get('/me', protect, getMe);

module.exports = router;

