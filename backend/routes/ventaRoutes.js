const express = require('express');
const router = express.Router();
const {
  registrarVenta,
  getVentas,
  getVentaById,
} = require('../controllers/ventaController');

router.route('/')
  .post(registrarVenta)
  .get(getVentas);

router.route('/:id')
  .get(getVentaById);

module.exports = router;

