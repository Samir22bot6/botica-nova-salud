const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const { sampleProductos } = require('../utils/seeder');

// Almacén en memoria resiliente en caso de que MongoDB Atlas esté desconectado o con credenciales inválidas
let inMemoryProductos = sampleProductos.map((p, idx) => ({
  ...p,
  _id: `mock-prod-${idx + 1}`,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Obtener todos los productos con filtros opcionales
// @route   GET /api/productos
// @access  Public / Private
const getProductos = async (req, res, next) => {
  try {
    const { busqueda, categoria, laboratorio, estado } = req.query;

    if (isDBConnected()) {
      let query = {};

      if (busqueda) {
        query.$or = [
          { nombre: { $regex: busqueda, $options: 'i' } },
          { laboratorio: { $regex: busqueda, $options: 'i' } },
          { lote: { $regex: busqueda, $options: 'i' } },
          { categoria: { $regex: busqueda, $options: 'i' } },
        ];
      }

      if (categoria && categoria !== 'Todas') {
        query.categoria = categoria;
      }

      if (laboratorio && laboratorio !== 'Todos') {
        query.laboratorio = laboratorio;
      }

      const productos = await Producto.find(query).sort({ nombre: 1 });

      let resultado = productos;
      if (estado === 'stock_bajo') {
        resultado = productos.filter((p) => p.stockActual <= p.stockMinimo);
      } else if (estado === 'por_vencer') {
        const hoy = new Date();
        const limite60dias = new Date();
        limite60dias.setDate(hoy.getDate() + 60);
        resultado = productos.filter(
          (p) => new Date(p.fechaVencimiento) <= limite60dias
        );
      }

      return res.json({
        success: true,
        fuente: 'MongoDB Atlas',
        total: resultado.length,
        productos: resultado,
      });
    }

    // Modo Fallback en Memoria (Resiliencia ante error de credenciales remotas)
    let filtrados = [...inMemoryProductos];

    if (busqueda) {
      const q = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.laboratorio.toLowerCase().includes(q) ||
          p.lote.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
      );
    }

    if (categoria && categoria !== 'Todas') {
      filtrados = filtrados.filter((p) => p.categoria === categoria);
    }

    if (laboratorio && laboratorio !== 'Todos') {
      filtrados = filtrados.filter((p) => p.laboratorio === laboratorio);
    }

    if (estado === 'stock_bajo') {
      filtrados = filtrados.filter((p) => p.stockActual <= p.stockMinimo);
    } else if (estado === 'por_vencer') {
      const hoy = new Date();
      const limite60dias = new Date();
      limite60dias.setDate(hoy.getDate() + 60);
      filtrados = filtrados.filter(
        (p) => new Date(p.fechaVencimiento) <= limite60dias
      );
    }

    res.json({
      success: true,
      fuente: 'Modo Resiliente (En Memoria - Atlas Offline/Bad Auth)',
      total: filtrados.length,
      productos: filtrados,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// @access  Public / Private
const getProductoById = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const producto = await Producto.findById(req.params.id);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado en el inventario.',
        });
      }
      return res.json({ success: true, producto });
    }

    const producto = inMemoryProductos.find((p) => String(p._id) === String(req.params.id));
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado en el inventario.',
      });
    }
    res.json({ success: true, producto });
  } catch (error) {
    next(error);
  }
};

// @desc    Registrar nuevo producto / lote
// @route   POST /api/productos
// @access  Private (Admin, Farmacéutico)
const createProducto = async (req, res, next) => {
  try {
    const {
      nombre,
      laboratorio,
      lote,
      fechaVencimiento,
      categoria,
      stockActual,
      stockMinimo,
      precioVenta,
      ubicacion,
    } = req.body;

    if (isDBConnected()) {
      const nuevoProducto = await Producto.create({
        nombre,
        laboratorio,
        lote,
        fechaVencimiento,
        categoria,
        stockActual: Number(stockActual) || 0,
        stockMinimo: Number(stockMinimo) || 5,
        precioVenta: Number(precioVenta) || 0,
        ubicacion: ubicacion || 'Estante General',
      });

      return res.status(201).json({
        success: true,
        message: 'Medicamento registrado correctamente en MongoDB Atlas.',
        producto: nuevoProducto,
      });
    }

    const nuevoProducto = {
      _id: `mock-prod-${Date.now()}`,
      nombre,
      laboratorio,
      lote,
      fechaVencimiento: new Date(fechaVencimiento),
      categoria,
      stockActual: Number(stockActual) || 0,
      stockMinimo: Number(stockMinimo) || 5,
      precioVenta: Number(precioVenta) || 0,
      ubicacion: ubicacion || 'Estante General',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryProductos.unshift(nuevoProducto);

    res.status(201).json({
      success: true,
      message: 'Medicamento registrado correctamente (Modo Resiliente).',
      producto: nuevoProducto,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar medicamento existente
// @route   PUT /api/productos/:id
// @access  Private (Admin, Farmacéutico)
const updateProducto = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const producto = await Producto.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado.',
        });
      }

      return res.json({
        success: true,
        message: 'Medicamento actualizado exitosamente en MongoDB Atlas.',
        producto,
      });
    }

    const index = inMemoryProductos.findIndex((p) => String(p._id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado.',
      });
    }

    inMemoryProductos[index] = {
      ...inMemoryProductos[index],
      ...req.body,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      message: 'Medicamento actualizado exitosamente.',
      producto: inMemoryProductos[index],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar medicamento
// @route   DELETE /api/productos/:id
// @access  Private (Admin)
const deleteProducto = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const producto = await Producto.findByIdAndDelete(req.params.id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado.',
        });
      }

      return res.json({
        success: true,
        message: 'Medicamento eliminado de MongoDB Atlas.',
      });
    }

    const index = inMemoryProductos.findIndex((p) => String(p._id) === String(req.params.id));
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado.',
      });
    }

    inMemoryProductos.splice(index, 1);
    res.json({
      success: true,
      message: 'Medicamento eliminado del inventario.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ajuste rápido de stock (+ / -)
// @route   PATCH /api/productos/:id/stock
// @access  Private (Admin, Farmacéutico)
const ajustarStock = async (req, res, next) => {
  try {
    const { cantidad } = req.body;

    if (isDBConnected()) {
      const producto = await Producto.findById(req.params.id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado.',
        });
      }

      const nuevoStock = producto.stockActual + Number(cantidad);
      if (nuevoStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'El stock resultante no puede ser negativo.',
        });
      }

      producto.stockActual = nuevoStock;
      await producto.save();

      return res.json({
        success: true,
        message: `Stock actualizado a ${producto.stockActual} unidades.`,
        producto,
      });
    }

    const prod = inMemoryProductos.find((p) => String(p._id) === String(req.params.id));
    if (!prod) {
      return res.status(404).json({
        success: false,
        message: 'Medicamento no encontrado.',
      });
    }

    const nuevoStock = prod.stockActual + Number(cantidad);
    if (nuevoStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'El stock resultante no puede ser negativo.',
      });
    }

    prod.stockActual = nuevoStock;
    prod.updatedAt = new Date();

    res.json({
      success: true,
      message: `Stock actualizado a ${prod.stockActual} unidades.`,
      producto: prod,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ALGORITMO / ENDPOINT DE ALERTAS:
//          Filtra automáticamente productos con stockActual <= stockMinimo o próximos a vencer (<= 60 días)
// @route   GET /api/productos/alertas
// @access  Public / Private
const getAlertas = async (req, res, next) => {
  try {
    const hoy = new Date();
    const limiteVencimiento = new Date();
    limiteVencimiento.setDate(hoy.getDate() + 60);

    if (isDBConnected()) {
      const stockBajo = await Producto.find({
        $expr: { $lte: ['$stockActual', '$stockMinimo'] },
      }).sort({ stockActual: 1 });

      const proximosVencer = await Producto.find({
        fechaVencimiento: { $lte: limiteVencimiento },
      }).sort({ fechaVencimiento: 1 });

      const agotados = stockBajo.filter((p) => p.stockActual === 0);
      const yaVencidos = proximosVencer.filter((p) => new Date(p.fechaVencimiento) < hoy);

      return res.json({
        success: true,
        timestamp: new Date(),
        totalAlertas: stockBajo.length + proximosVencer.length,
        resumen: {
          stockBajoCount: stockBajo.length,
          agotadosCount: agotados.length,
          proximosVencerCount: proximosVencer.length,
          yaVencidosCount: yaVencidos.length,
        },
        alertas: {
          stockBajo,
          proximosVencer,
        },
      });
    }

    // Modo en Memoria
    const stockBajo = inMemoryProductos
      .filter((p) => p.stockActual <= p.stockMinimo)
      .sort((a, b) => a.stockActual - b.stockActual);

    const proximosVencer = inMemoryProductos
      .filter((p) => new Date(p.fechaVencimiento) <= limiteVencimiento)
      .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

    const agotados = stockBajo.filter((p) => p.stockActual === 0);
    const yaVencidos = proximosVencer.filter((p) => new Date(p.fechaVencimiento) < hoy);

    res.json({
      success: true,
      timestamp: new Date(),
      totalAlertas: stockBajo.length + proximosVencer.length,
      resumen: {
        stockBajoCount: stockBajo.length,
        agotadosCount: agotados.length,
        proximosVencerCount: proximosVencer.length,
        yaVencidosCount: yaVencidos.length,
      },
      alertas: {
        stockBajo,
        proximosVencer,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  ajustarStock,
  getAlertas,
  inMemoryProductos,
};

