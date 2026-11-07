const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Venta = require('../models/Venta');

const sampleUsuarios = [
  {
    nombre: 'Lic. Carlos Mendoza (Admin)',
    email: 'admin@novasalud.com',
    password: 'admin123',
    rol: 'Admin',
  },
  {
    nombre: 'Q.F. Elena Ramos (Farmacéutica)',
    email: 'farmacia@novasalud.com',
    password: 'farma123',
    rol: 'Farmacéutico',
  },
  {
    nombre: 'Juan Pérez (Cajero)',
    email: 'caja@novasalud.com',
    password: 'caja123',
    rol: 'Cajero',
  },
];

// Fechas relativas para pruebas de vencimiento
const hoy = new Date();
const fechaVence15Dias = new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000);
const fechaVence40Dias = new Date(hoy.getTime() + 40 * 24 * 60 * 60 * 1000);
const fechaVence2Anios = new Date(hoy.getTime() + 730 * 24 * 60 * 60 * 1000);
const fechaVence1Anio = new Date(hoy.getTime() + 365 * 24 * 60 * 60 * 1000);

const sampleProductos = [
  {
    nombre: 'Paracetamol 500mg (Caja x 100)',
    laboratorio: 'Laboratorios Portugal',
    lote: 'LP-2026-01A',
    fechaVencimiento: fechaVence2Anios,
    categoria: 'Analgésicos',
    stockActual: 120,
    stockMinimo: 20,
    precioVenta: 15.50,
    ubicacion: 'Estante A1 - Fila 1',
  },
  {
    nombre: 'Ibuprofeno 400mg (Blister x 10)',
    laboratorio: 'Genfar',
    lote: 'GF-2026-08B',
    fechaVencimiento: fechaVence1Anio,
    categoria: 'Antiinflamatorios',
    stockActual: 85,
    stockMinimo: 15,
    precioVenta: 6.80,
    ubicacion: 'Estante A1 - Fila 2',
  },
  {
    nombre: 'Amoxicilina + Ácido Clavulánico 500/125mg',
    laboratorio: 'Medifarma',
    lote: 'MF-2026-11C',
    fechaVencimiento: fechaVence2Anios,
    categoria: 'Antibióticos',
    stockActual: 45,
    stockMinimo: 10,
    precioVenta: 28.00,
    ubicacion: 'Estante B2 - Fila 1',
  },
  {
    nombre: 'Azitromicina 500mg (Caja x 3)',
    laboratorio: 'Laboratorios Bagó',
    lote: 'BG-2025-04D',
    fechaVencimiento: fechaVence15Dias, // ALERTA: PRÓXIMO A VENCER (15 DÍAS)
    categoria: 'Antibióticos',
    stockActual: 18,
    stockMinimo: 10,
    precioVenta: 22.50,
    ubicacion: 'Estante B2 - Fila 3',
  },
  {
    nombre: 'Cetirizina 10mg (Blister x 10)',
    laboratorio: 'Farmindustria',
    lote: 'FI-2026-02E',
    fechaVencimiento: fechaVence1Anio,
    categoria: 'Antihistamínicos',
    stockActual: 4, // ALERTA: STOCK BAJO (4 <= 10)
    stockMinimo: 10,
    precioVenta: 8.50,
    ubicacion: 'Estante C1 - Fila 1',
  },
  {
    nombre: 'Omeprazol 20mg (Frasco x 30)',
    laboratorio: 'Laboratorios Portugal',
    lote: 'LP-2026-09F',
    fechaVencimiento: fechaVence2Anios,
    categoria: 'Gastroenterología',
    stockActual: 3, // ALERTA: STOCK CRÍTICO (3 <= 15)
    stockMinimo: 15,
    precioVenta: 19.90,
    ubicacion: 'Estante C2 - Fila 2',
  },
  {
    nombre: 'Loratadina 10mg (Caja x 20)',
    laboratorio: 'Bayer',
    lote: 'BY-2026-05G',
    fechaVencimiento: fechaVence40Dias, // ALERTA: PRÓXIMO A VENCER (40 DÍAS)
    categoria: 'Antihistamínicos',
    stockActual: 2, // ALERTA DOBLE: STOCK BAJO (2 <= 8) Y VENCE PRONTO
    stockMinimo: 8,
    precioVenta: 14.00,
    ubicacion: 'Estante C1 - Fila 2',
  },
  {
    nombre: 'Vitamina C 1000mg Efervescente (Tubo x 10)',
    laboratorio: 'Bayer (Redoxon)',
    lote: 'RDX-2026-03H',
    fechaVencimiento: fechaVence2Anios,
    categoria: 'Vitaminas y Suplementos',
    stockActual: 60,
    stockMinimo: 10,
    precioVenta: 18.00,
    ubicacion: 'Estante D1 - Mostrador',
  },
  {
    nombre: 'Alcohol Antiséptico 70° (Frasco 1 Litro)',
    laboratorio: 'Alkofarma',
    lote: 'AK-2026-10I',
    fechaVencimiento: fechaVence2Anios,
    categoria: 'Cuidado Personal y Primeros Auxilios',
    stockActual: 40,
    stockMinimo: 10,
    precioVenta: 9.50,
    ubicacion: 'Almacén Central - Piso 1',
  },
  {
    nombre: 'Termómetro Digital Infrarrojo',
    laboratorio: 'Omron',
    lote: 'OM-2026-99J',
    fechaVencimiento: fechaVence2Anios,
    categoria: 'Dispositivos Médicos',
    stockActual: 12,
    stockMinimo: 5,
    precioVenta: 65.00,
    ubicacion: 'Vitrina 1 - Equipos',
  },
];

const seedDB = async () => {
  try {
    console.log('[Seeder] Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seeder] Conexión establecida.');

    console.log('[Seeder] Limpiando colecciones anteriores...');
    await Usuario.deleteMany({});
    await Producto.deleteMany({});
    await Venta.deleteMany({});

    console.log('[Seeder] Insertando usuarios con roles...');
    for (const u of sampleUsuarios) {
      await Usuario.create(u);
    }
    console.log(`[Seeder] ${sampleUsuarios.length} usuarios creados exitosamente.`);

    console.log('[Seeder] Insertando catálogo de medicamentos...');
    const productosCreados = await Producto.insertMany(sampleProductos);
    console.log(`[Seeder] ${productosCreados.length} medicamentos insertados con éxito.`);

    console.log('[Seeder] Creando venta de prueba inicial...');
    const p1 = productosCreados[0];
    const p2 = productosCreados[1];

    await Venta.create({
      numeroComprobante: 'BV-2026-000001',
      cliente: {
        nombre: 'Rosa María Flores',
        documento: '45892147',
        telefono: '987654321',
      },
      productos: [
        {
          productoId: p1._id,
          nombre: p1.nombre,
          laboratorio: p1.laboratorio,
          lote: p1.lote,
          cantidad: 2,
          precioUnitario: p1.precioVenta,
          subtotal: p1.precioVenta * 2,
        },
        {
          productoId: p2._id,
          nombre: p2.nombre,
          laboratorio: p2.laboratorio,
          lote: p2.lote,
          cantidad: 1,
          precioUnitario: p2.precioVenta,
          subtotal: p2.precioVenta * 1,
        },
      ],
      total: (p1.precioVenta * 2) + p2.precioVenta,
      metodoPago: 'Efectivo',
      montoRecibido: 50.00,
      vuelto: 50.00 - ((p1.precioVenta * 2) + p2.precioVenta),
      vendedor: 'Juan Pérez (Cajero)',
      fecha: new Date(),
    });

    console.log('[Seeder] Proceso finalizado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error al inicializar datos:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { seedDB, sampleProductos, sampleUsuarios };
