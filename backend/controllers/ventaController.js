const mongoose = require('mongoose');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const { inMemoryProductos } = require('./productoController');

let inMemoryVentas = [];
let contadorComprobantes = 1;

const isDBConnected = () => mongoose.connection.readyState === 1;

// Generador de número correlativo de comprobante: BV-AAAA-NNNNNN
const generarNumeroComprobante = async () => {
  const anio = new Date().getFullYear();
  if (isDBConnected()) {
    const totalVentas = await Venta.countDocuments();
    const correlativo = String(totalVentas + 1).padStart(6, '0');
    return `BV-${anio}-${correlativo}`;
  }
  const correlativo = String(contadorComprobantes++).padStart(6, '0');
  return `BV-${anio}-${correlativo}`;
};

// @desc    Registrar nueva venta (POS) con validación y descuento automático de stock
// @route   POST /api/ventas
// @access  Public / Private
const registrarVenta = async (req, res, next) => {
  try {
    const { cliente, productos, metodoPago, montoRecibido, vendedor } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto en la venta.',
      });
    }

    const productosValidados = [];
    let totalCalculado = 0;

    // MODO MONGODB ATLAS
    if (isDBConnected()) {
      for (const item of productos) {
        const productoDB = await Producto.findById(item.productoId);

        if (!productoDB) {
          return res.status(404).json({
            success: false,
            message: `El medicamento con ID ${item.productoId} no existe en el catálogo.`,
          });
        }

        const cantidadPedida = Number(item.cantidad);
        if (cantidadPedida <= 0) {
          return res.status(400).json({
            success: false,
            message: `Cantidad inválida para ${productoDB.nombre}. Debe ser al menos 1 unidad.`,
          });
        }

        if (productoDB.stockActual < cantidadPedida) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para "${productoDB.nombre}". Stock disponible: ${productoDB.stockActual} unidades, Solicitado: ${cantidadPedida}.`,
          });
        }

        const subtotalItem = Number((productoDB.precioVenta * cantidadPedida).toFixed(2));
        totalCalculado += subtotalItem;

        productosValidados.push({
          productoId: productoDB._id,
          nombre: productoDB.nombre,
          laboratorio: productoDB.laboratorio,
          lote: productoDB.lote,
          cantidad: cantidadPedida,
          precioUnitario: productoDB.precioVenta,
          subtotal: subtotalItem,
        });
      }

      totalCalculado = Number(totalCalculado.toFixed(2));

      // Descuento atómico de stock en MongoDB Atlas
      for (const item of productosValidados) {
        await Producto.findByIdAndUpdate(item.productoId, {
          $inc: { stockActual: -item.cantidad },
        });
      }

      const montoPagado = Number(montoRecibido) || totalCalculado;
      const vuelto = metodoPago === 'Efectivo' && montoPagado >= totalCalculado
        ? Number((montoPagado - totalCalculado).toFixed(2))
        : 0;

      const numeroComprobante = await generarNumeroComprobante();

      const nuevaVenta = await Venta.create({
        numeroComprobante,
        cliente: {
          nombre: cliente?.nombre?.trim() || 'PÚBLICO GENERAL',
          documento: cliente?.documento?.trim() || '00000000',
          telefono: cliente?.telefono?.trim() || '',
        },
        productos: productosValidados,
        total: totalCalculado,
        metodoPago: metodoPago || 'Efectivo',
        montoRecibido: montoPagado,
        vuelto,
        vendedor: vendedor || (req.user ? req.user.nombre : 'Cajero Nova Salud'),
        fecha: new Date(),
      });

      return res.status(201).json({
        success: true,
        fuente: 'MongoDB Atlas',
        message: 'Venta procesada con éxito y stock descontado en MongoDB Atlas.',
        venta: nuevaVenta,
      });
    }

    // MODO RESILIENTE EN MEMORIA (FALLBACK)
    for (const item of productos) {
      const prod = inMemoryProductos.find((p) => String(p._id) === String(item.productoId));

      if (!prod) {
        return res.status(404).json({
          success: false,
          message: `El medicamento con ID ${item.productoId} no existe en el catálogo.`,
        });
      }

      const cantidadPedida = Number(item.cantidad);
      if (cantidadPedida <= 0) {
        return res.status(400).json({
          success: false,
          message: `Cantidad inválida para ${prod.nombre}.`,
        });
      }

      if (prod.stockActual < cantidadPedida) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para "${prod.nombre}". Stock disponible: ${prod.stockActual} unidades, Solicitado: ${cantidadPedida}.`,
        });
      }

      const subtotalItem = Number((prod.precioVenta * cantidadPedida).toFixed(2));
      totalCalculado += subtotalItem;

      productosValidados.push({
        productoId: prod._id,
        nombre: prod.nombre,
        laboratorio: prod.laboratorio,
        lote: prod.lote,
        cantidad: cantidadPedida,
        precioUnitario: prod.precioVenta,
        subtotal: subtotalItem,
      });
    }

    totalCalculado = Number(totalCalculado.toFixed(2));

    // Descuento en memoria
    for (const item of productosValidados) {
      const target = inMemoryProductos.find((p) => String(p._id) === String(item.productoId));
      if (target) {
        target.stockActual -= item.cantidad;
        target.updatedAt = new Date();
      }
    }

    const montoPagado = Number(montoRecibido) || totalCalculado;
    const vuelto = metodoPago === 'Efectivo' && montoPagado >= totalCalculado
      ? Number((montoPagado - totalCalculado).toFixed(2))
      : 0;

    const numeroComprobante = await generarNumeroComprobante();

    const nuevaVenta = {
      _id: `mock-venta-${Date.now()}`,
      numeroComprobante,
      cliente: {
        nombre: cliente?.nombre?.trim() || 'PÚBLICO GENERAL',
        documento: cliente?.documento?.trim() || '00000000',
        telefono: cliente?.telefono?.trim() || '',
      },
      productos: productosValidados,
      total: totalCalculado,
      metodoPago: metodoPago || 'Efectivo',
      montoRecibido: montoPagado,
      vuelto,
      vendedor: vendedor || (req.user ? req.user.nombre : 'Cajero Nova Salud'),
      fecha: new Date(),
    };

    inMemoryVentas.unshift(nuevaVenta);

    res.status(201).json({
      success: true,
      fuente: 'Modo Resiliente (En Memoria)',
      message: 'Venta procesada con éxito y stock descontado.',
      venta: nuevaVenta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener historial de ventas con estadísticas
// @route   GET /api/ventas
// @access  Public / Private
const getVentas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin, limit = 50 } = req.query;

    if (isDBConnected()) {
      let query = {};
      if (fechaInicio || fechaFin) {
        query.fecha = {};
        if (fechaInicio) query.fecha.$gte = new Date(fechaInicio);
        if (fechaFin) query.fecha.$lte = new Date(fechaFin);
      }

      const ventas = await Venta.find(query)
        .sort({ fecha: -1 })
        .limit(Number(limit));

      const totalRecaudado = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

      return res.json({
        success: true,
        fuente: 'MongoDB Atlas',
        totalVentas: ventas.length,
        totalRecaudado: Number(totalRecaudado.toFixed(2)),
        ventas,
      });
    }

    const totalRecaudado = inMemoryVentas.reduce((acc, v) => acc + (v.total || 0), 0);
    res.json({
      success: true,
      fuente: 'Modo Resiliente (En Memoria)',
      totalVentas: inMemoryVentas.length,
      totalRecaudado: Number(totalRecaudado.toFixed(2)),
      ventas: inMemoryVentas.slice(0, Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener detalle de comprobante por ID
// @route   GET /api/ventas/:id
// @access  Public / Private
const getVentaById = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const venta = await Venta.findById(req.params.id);
      if (!venta) {
        return res.status(404).json({
          success: false,
          message: 'Comprobante de venta no encontrado.',
        });
      }
      return res.json({ success: true, venta });
    }

    const venta = inMemoryVentas.find((v) => String(v._id) === String(req.params.id));
    if (!venta) {
      return res.status(404).json({
        success: false,
        message: 'Comprobante de venta no encontrado.',
      });
    }
    res.json({ success: true, venta });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarVenta,
  getVentas,
  getVentaById,
};

