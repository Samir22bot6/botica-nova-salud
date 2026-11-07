const express = require('express');
const router = express.Router();
const {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  ajustarStock,
  getAlertas,
} = require('../controllers/productoController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

// Endpoint de alertas (debe ir antes de /:id para evitar colisión de ruta)
router.get('/alertas', getAlertas);

// Consulta de productos (abierto a personal de farmacia y POS)
// Creación restringida estrictamente a usuarios con rol 'Admin'
router.route('/')
  .get(getProductos)
  .post(authMiddleware, checkRole('Admin'), createProducto);

// Consulta por ID abierta; Edición y Eliminación restringidas a 'Admin'
router.route('/:id')
  .get(getProductoById)
  .put(authMiddleware, checkRole('Admin'), updateProducto)
  .delete(authMiddleware, checkRole('Admin'), deleteProducto);

// Ajuste de stock (requiere autenticación)
router.patch('/:id/stock', authMiddleware, ajustarStock);

module.exports = router;

