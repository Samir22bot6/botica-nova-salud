const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    laboratorio: {
      type: String,
    },
    lote: {
      type: String,
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad mínima es 1'],
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo'],
    },
  },
  { _id: false }
);

const ventaSchema = new mongoose.Schema(
  {
    numeroComprobante: {
      type: String,
      required: [true, 'El número de comprobante es obligatorio'],
      unique: true,
      trim: true,
      index: true,
    },
    cliente: {
      nombre: {
        type: String,
        default: 'PÚBLICO GENERAL',
        trim: true,
      },
      documento: {
        type: String,
        default: '00000000',
        trim: true,
      },
      telefono: {
        type: String,
        default: '',
        trim: true,
      },
    },
    productos: {
      type: [itemVentaSchema],
      validate: [
        (val) => val && val.length > 0,
        'La venta debe contener al menos un producto',
      ],
    },
    total: {
      type: Number,
      required: [true, 'El total de la venta es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
    metodoPago: {
      type: String,
      enum: {
        values: ['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia'],
        message: 'Método de pago no válido',
      },
      required: [true, 'El método de pago es obligatorio'],
      default: 'Efectivo',
    },
    montoRecibido: {
      type: Number,
      default: 0,
    },
    vuelto: {
      type: Number,
      default: 0,
    },
    vendedor: {
      type: String,
      default: 'Cajero Nova Salud',
    },
    fecha: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venta', ventaSchema);

