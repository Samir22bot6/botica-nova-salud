/**
 * Script de Pruebas de Integración y Verificación Automatizada
 * Valida las 5 Capas de Seguridad, Autenticación JWT, Roles, CRUD de Inventario, Algoritmo de Alertas y Transacción POS
 * Ejecución: node test-integration.js
 */

const { app, server } = require('./backend/server');

async function runTests() {
  console.log('=================================================================');
  console.log('  SUITE DE PRUEBAS AUTOMATIZADAS - BOTICA NOVA SALUD (SENATI)');
  console.log('=================================================================');

  let passed = 0;
  let total = 0;

  function assert(description, condition) {
    total++;
    if (condition) {
      console.log(`  [PASS] Test ${total}: ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] Test ${total}: ${description}`);
    }
  }

  // Esperar a que el servidor inicialice listeners
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const BASE_URL = 'http://127.0.0.1:5000/api';

  try {
    // PRUEBA 1: 5 Capas de Seguridad y Healthcheck
    console.log('\n[1/6] Verificando 5 Capas de Seguridad Middleware...');
    const resHealth = await fetch(`${BASE_URL}/health`);
    const dataHealth = await resHealth.json();
    assert('Healthcheck responde status 200', resHealth.status === 200);
    assert('Capa 1: Helmet activo', dataHealth.seguridad?.capa1_helmet === 'Activo');
    assert('Capa 2: CORS activo', dataHealth.seguridad?.capa2_cors === 'Activo');
    assert('Capa 3: Rate Limiting activo', dataHealth.seguridad?.capa3_rateLimit === 'Activo');
    assert('Capa 4: HTTPS Redirection activo', dataHealth.seguridad?.capa4_httpsRedirect === 'Activo');
    assert('Capa 5: Morgan Audit Logs activo', dataHealth.seguridad?.capa5_morganAudit === 'Activo');

    // PRUEBA 2: Autenticación JWT y Roles de Usuario
    console.log('\n[2/6] Verificando Autenticación JWT y Roles (Admin / Cajero)...');
    
    // Login Admin
    const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@novasalud.com', password: 'admin123' }),
    });
    const dataLoginAdmin = await resLoginAdmin.json();
    assert('Login exitoso de Administrador', resLoginAdmin.status === 200 && dataLoginAdmin.token);
    assert('Rol de usuario es Admin', dataLoginAdmin.usuario?.rol === 'Admin');
    const adminToken = dataLoginAdmin.token;

    // Login Cajero
    const resLoginCajero = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'caja@novasalud.com', password: 'caja123' }),
    });
    const dataLoginCajero = await resLoginCajero.json();
    assert('Login exitoso de Cajero', resLoginCajero.status === 200 && dataLoginCajero.token);
    assert('Rol de usuario es Cajero', dataLoginCajero.usuario?.rol === 'Cajero');
    const cajeroToken = dataLoginCajero.token;

    // PRUEBA 3: Restricción de Roles (checkRole: Solo Admin puede crear medicamentos)
    console.log('\n[3/6] Verificando Restricción de Permisos RBAC (checkRole)...');
    const nuevoMedicamento = {
      nombre: 'Medicamento Test Control Permisos',
      laboratorio: 'Medifarma',
      lote: 'LT-TEST-01',
      fechaVencimiento: '2028-01-01',
      categoria: 'Analgésicos',
      stockActual: 30,
      stockMinimo: 5,
      precioVenta: 15.0,
      ubicacion: 'Vitrina 1',
    };

    // Intento con rol Cajero (debe ser rechazado con 403 Forbidden)
    const resIntentoCajero = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cajeroToken}`,
      },
      body: JSON.stringify(nuevoMedicamento),
    });
    assert('Cajero no puede registrar medicamentos (HTTP 403 Forbidden)', resIntentoCajero.status === 403);

    // Intento con rol Admin (debe ser admitido con 201 Created)
    const resIntentoAdmin = await fetch(`${BASE_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(nuevoMedicamento),
    });
    const dataNuevoProd = await resIntentoAdmin.json();
    assert('Admin puede registrar nuevos medicamentos (HTTP 201 Created)', resIntentoAdmin.status === 201);

    // PRUEBA 4: Consulta de Catálogo y Filtrado
    console.log('\n[4/6] Verificando Catálogo e Inventario de Medicamentos...');
    const resProd = await fetch(`${BASE_URL}/productos`);
    const dataProd = await resProd.json();
    assert('Obtiene catálogo de productos con éxito', dataProd.success === true);
    assert('El inventario contiene medicamentos registrados', dataProd.productos && dataProd.productos.length > 0);

    const primerProd = dataProd.productos[0];
    const stockInicial = primerProd.stockActual;

    // PRUEBA 5: Algoritmo de Alertas Sanitarias y de Reorden
    console.log('\n[5/6] Verificando Algoritmo de Alertas Sanitarias y Reorden...');
    const resAlertas = await fetch(`${BASE_URL}/productos/alertas`);
    const dataAlertas = await resAlertas.json();
    assert('Algoritmo de alertas calcula total de incidencias', typeof dataAlertas.totalAlertas === 'number');
    assert('Calcula conteo de stock bajo o reorden', dataAlertas.resumen && typeof dataAlertas.resumen.stockBajoCount === 'number');
    assert('Calcula conteo de medicamentos próximos a vencer', typeof dataAlertas.resumen.proximosVencerCount === 'number');

    // PRUEBA 6: Transacción de Venta POS con Validación y Descuento de Stock
    console.log('\n[6/6] Verificando Motor de Ventas POS y Descuento Atómico de Stock...');
    const ventaPayload = {
      cliente: {
        nombre: 'Rosa Evaluadora SENATI',
        documento: '45891234',
        telefono: '987654321',
      },
      productos: [
        {
          productoId: primerProd._id,
          cantidad: 2,
        },
      ],
      metodoPago: 'Efectivo',
      montoRecibido: 100.0,
      vendedor: 'Cajero SENATI',
    };

    const resVenta = await fetch(`${BASE_URL}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ventaPayload),
    });
    const dataVenta = await resVenta.json();
    assert('Transacción POS responde código 201 Created', resVenta.status === 201);
    assert('Emite boleta con formato correlativo BV-AAAA-NNNNNN', dataVenta.venta?.numeroComprobante?.startsWith('BV-'));
    assert('Calcula vuelto correctamente', dataVenta.venta?.vuelto === 100.0 - dataVenta.venta?.total);

    // Verificar que el stock fue descontado
    const resProdPost = await fetch(`${BASE_URL}/productos/${primerProd._id}`);
    const dataProdPost = await resProdPost.json();
    assert(
      'El stock fue descontado automáticamente (-2 unidades)',
      dataProdPost.producto.stockActual === stockInicial - 2
    );

    // Validación de Prevención de Sobreventa (Stock Insuficiente)
    const sobreventaPayload = {
      cliente: { nombre: 'Cliente Sobreventa', documento: '00000000' },
      productos: [{ productoId: primerProd._id, cantidad: 999999 }],
      metodoPago: 'Efectivo',
    };
    const resSobreventa = await fetch(`${BASE_URL}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sobreventaPayload),
    });
    const dataSobreventa = await resSobreventa.json();
    assert('Rechaza venta con stock insuficiente con código 400', resSobreventa.status === 400);
    assert('Envía mensaje descriptivo de stock insuficiente', dataSobreventa.message.includes('Stock insuficiente'));

    console.log('=================================================================');
    console.log(`  RESUMEN: ${passed}/${total} pruebas aprobadas exitosamente.`);
    console.log('=================================================================');

    server.close(() => {
      process.exit(passed === total ? 0 : 1);
    });
  } catch (error) {
    console.error('Error durante la ejecución de pruebas:', error);
    server.close(() => {
      process.exit(1);
    });
  }
}

runTests();
