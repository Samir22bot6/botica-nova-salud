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

// Endpoint de alertas (debe ir antes de /:id para evitar colisión de ruta)
router.get('/alertas', getAlertas);

// CRUD básico y avanzado de productos
router.route('/')
  .get(getProductos)
  .post(createProducto);

router.route('/:id')
  .get(getProductoById)
  .put(updateProducto)
  .delete(deleteProducto);

// Ajuste rápido de stock
router.patch('/:id/stock', ajustarStock);

module.exports = router;

