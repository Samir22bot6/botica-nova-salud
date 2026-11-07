const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del medicamento es obligatorio'],
      trim: true,
      index: true,
    },
    laboratorio: {
      type: String,
      required: [true, 'El laboratorio fabricante es obligatorio'],
      trim: true,
      index: true,
    },
    lote: {
      type: String,
      required: [true, 'El número de lote es obligatorio'],
      trim: true,
      uppercase: true,
    },
    fechaVencimiento: {
      type: Date,
      required: [true, 'La fecha de vencimiento es obligatoria'],
      index: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
      index: true,
    },
    stockActual: {
      type: Number,
      required: [true, 'El stock actual es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
      index: true,
    },
    stockMinimo: {
      type: Number,
      required: [true, 'El stock mínimo es obligatorio'],
      min: [0, 'El stock mínimo no puede ser negativo'],
      default: 5,
    },
    precioVenta: {
      type: Number,
      required: [true, 'El precio de venta es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    ubicacion: {
      type: String,
      trim: true,
      default: 'Estante General',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual para determinar estado del stock
productoSchema.virtual('esStockBajo').get(function () {
  return this.stockActual <= this.stockMinimo;
});

// Virtual para determinar si está próximo a vencer (dentro de 60 días)
productoSchema.virtual('diasParaVencer').get(function () {
  if (!this.fechaVencimiento) return null;
  const hoy = new Date();
  const diffTime = this.fechaVencimiento.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);

