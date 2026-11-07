import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  AlertCircle, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  ShoppingBag,
  Clock,
  MapPin,
  Tag
} from 'lucide-react';
import api from '../api/axiosClient';
import TicketModal from '../components/TicketModal';
import { useAuth } from '../context/AuthContext';

const METODOS_PAGO = [
  { id: 'Efectivo', label: 'Efectivo', icon: DollarSign },
  { id: 'Yape', label: 'Yape', icon: Smartphone },
  { id: 'Plin', label: 'Plin', icon: Smartphone },
  { id: 'Tarjeta', label: 'Tarjeta POS', icon: CreditCard },
];

const POSPage = ({ productos, onVentaRealizada, onRefresh }) => {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [carrito, setCarrito] = useState([]);
  
  // Datos del Cliente
  const [cliente, setCliente] = useState({
    nombre: 'PÚBLICO GENERAL',
    documento: '00000000',
    telefono: '',
  });

  // Pago
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [errorVenta, setErrorVenta] = useState('');
  const [ventaExitosa, setVentaExitosa] = useState(null);

  // Extracción de categorías únicas
  const categorias = useMemo(() => {
    const setCats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return ['Todas', ...Array.from(setCats)];
  }, [productos]);

  // Filtrado reactivo de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.laboratorio.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.lote.toLowerCase().includes(busqueda.toLowerCase());

      const matchCat =
        categoriaSeleccionada === 'Todas' || p.categoria === categoriaSeleccionada;

      return matchBusqueda && matchCat;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  // Manejo del Carrito
  const agregarAlCarrito = (producto) => {
    setErrorVenta('');
    const itemExistente = carrito.find((i) => i.productoId === producto._id);

    if (itemExistente) {
      if (itemExistente.cantidad + 1 > producto.stockActual) {
        setErrorVenta(`No hay más stock disponible de ${producto.nombre} (Stock actual: ${producto.stockActual})`);
        return;
      }
      setCarrito(
        carrito.map((i) =>
          i.productoId === producto._id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: Number(((i.cantidad + 1) * i.precioUnitario).toFixed(2)) }
            : i
        )
      );
    } else {
      if (producto.stockActual < 1) {
        setErrorVenta(`El producto ${producto.nombre} se encuentra agotado.`);
        return;
      }
      setCarrito([
        ...carrito,
        {
          productoId: producto._id,
          nombre: producto.nombre,
          laboratorio: producto.laboratorio,
          lote: producto.lote,
          precioUnitario: producto.precioVenta,
          cantidad: 1,
          stockDisponible: producto.stockActual,
          subtotal: Number(producto.precioVenta.toFixed(2)),
        },
      ]);
    }
  };

  const modificarCantidad = (productoId, delta) => {
    setErrorVenta('');
    const item = carrito.find((i) => i.productoId === productoId);
    if (!item) return;

    const nuevaCant = item.cantidad + delta;
    if (nuevaCant <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }

    if (nuevaCant > item.stockDisponible) {
      setErrorVenta(`Stock máximo alcanzado para ${item.nombre} (${item.stockDisponible} unid.)`);
      return;
    }

    setCarrito(
      carrito.map((i) =>
        i.productoId === productoId
          ? {
              ...i,
              cantidad: nuevaCant,
              subtotal: Number((nuevaCant * i.precioUnitario).toFixed(2)),
            }
          : i
      )
    );
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter((i) => i.productoId !== productoId));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setErrorVenta('');
  };

  // Cálculos de Totales
  const total = useMemo(() => {
    return Number(carrito.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
  }, [carrito]);

  const vuelto = useMemo(() => {
    const recibido = Number(montoRecibido);
    if (metodoPago === 'Efectivo' && recibido >= total) {
      return Number((recibido - total).toFixed(2));
    }
    return 0;
  }, [montoRecibido, total, metodoPago]);

  // Procesar Venta / Emitir Comprobante
  const handleCobrar = async (e) => {
    e.preventDefault();
    setErrorVenta('');

    if (carrito.length === 0) {
      setErrorVenta('El carrito está vacío. Agregue medicamentos para emitir una venta.');
      return;
    }

    if (metodoPago === 'Efectivo' && montoRecibido && Number(montoRecibido) < total) {
      setErrorVenta(`El monto recibido (S/ ${montoRecibido}) es menor al total de la venta (S/ ${total}).`);
      return;
    }

    setProcesando(true);
    try {
      const payload = {
        cliente,
        productos: carrito.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
        })),
        metodoPago,
        montoRecibido: metodoPago === 'Efectivo' ? Number(montoRecibido) || total : total,
        vendedor: usuario?.nombre || 'Cajero Nova Salud',
      };

      const res = await api.post('/ventas', payload);
      setVentaExitosa(res.data.venta);
      vaciarCarrito();
      setMontoRecibido('');
      if (onVentaRealizada) onVentaRealizada();
    } catch (err) {
      setErrorVenta(err.message || 'Error al procesar la venta en el servidor.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div>
      {/* Encabezado Módulo POS */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Punto de Venta (POS) & Atención en Mostrador</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Dispensación ágil de medicamentos con validación y descuento automático de stock en MongoDB Atlas.
        </p>
      </div>

      <div className="pos-layout">
        {/* LADO IZQUIERDO: CATÁLOGO Y BUSCADOR */}
        <div>
          {/* Barra de búsqueda interactiva */}
          <div className="catalog-search-bar">
            <Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por medicamento, laboratorio (Bagó, Portugal, Bayer) o lote..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            )}
          </div>

          {/* Filtros rápidos por Categoría */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: categoriaSeleccionada === cat ? 'var(--primary)' : '#ffffff',
                  color: categoriaSeleccionada === cat ? '#ffffff' : 'var(--text-muted)',
                  border: `1px solid ${categoriaSeleccionada === cat ? 'var(--primary)' : 'var(--border)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grilla de Medicamentos */}
          {productosFiltrados.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 0.75rem auto', color: 'var(--warning)' }} />
              <p style={{ fontWeight: 600 }}>No se encontraron medicamentos con los criterios indicados.</p>
              <button className="btn-secondary" style={{ marginTop: '0.75rem' }} onClick={() => { setBusqueda(''); setCategoriaSeleccionada('Todas'); }}>
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid-2" style={{ gap: '0.9rem' }}>
              {productosFiltrados.map((prod) => {
                const stockBajo = prod.stockActual <= prod.stockMinimo;
                const agotado = prod.stockActual <= 0;
                const enCarrito = carrito.find((i) => i.productoId === prod._id);

                return (
                  <div key={prod._id} className="product-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className={`product-badge ${agotado ? 'badge-red' : stockBajo ? 'badge-amber' : 'badge-green'}`}>
                          {agotado ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'En Stock'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Lote: {prod.lote}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                        {prod.nombre}
                      </h3>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Tag size={13} />
                          <span>{prod.laboratorio} • {prod.categoria}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} />
                          <span>{prod.ubicacion || 'Estante General'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Disp: <strong style={{ color: agotado ? 'var(--danger)' : 'inherit' }}>{prod.stockActual}</strong> unid.
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                          S/ {Number(prod.precioVenta).toFixed(2)}
                        </div>
                      </div>

                      <button
                        className="btn-primary"
                        onClick={() => agregarAlCarrito(prod)}
                        disabled={agotado}
                        style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                      >
                        <Plus size={16} />
                        <span>{enCarrito ? `(${enCarrito.cantidad}) Agregar` : 'Agregar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LADO DERECHO: CARRITO Y CAJA POS */}
        <div>
          <div className="cart-card">
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Carrito de Venta</h2>
                <span className="product-badge badge-blue">{carrito.length} items</span>
              </div>
              {carrito.length > 0 && (
                <button onClick={vaciarCarrito} style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
                  Vaciar
                </button>
              )}
            </div>

            {errorVenta && (
              <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{errorVenta}</span>
              </div>
            )}

            {/* Lista de Items */}
            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <ShoppingBag size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                <p style={{ fontSize: '0.88rem' }}>El carrito está listo para agregar medicamentos.</p>
              </div>
            ) : (
              <div className="cart-items-list">
                {carrito.map((item) => (
                  <div key={item.productoId} className="cart-item">
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nombre}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        P.U: S/ {Number(item.precioUnitario).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button className="qty-btn" onClick={() => modificarCantidad(item.productoId, -1)}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: '22px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {item.cantidad}
                      </span>
                      <button className="qty-btn" onClick={() => modificarCantidad(item.productoId, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '70px', marginLeft: '0.5rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                        S/ {item.subtotal.toFixed(2)}
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.productoId)} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Datos del Cliente */}
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Datos del Comprobante (Cliente)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="DNI / RUC"
                  className="form-control"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  value={cliente.documento}
                  onChange={(e) => setCliente({ ...cliente, documento: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Nombre o Razón Social"
                  className="form-control"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  value={cliente.nombre}
                  onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                />
              </div>
            </div>

            {/* Métodos de Pago */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Método de Pago
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                {METODOS_PAGO.map((mp) => {
                  const Icon = mp.icon;
                  const activo = metodoPago === mp.id;
                  return (
                    <button
                      key={mp.id}
                      type="button"
                      onClick={() => setMetodoPago(mp.id)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${activo ? 'var(--primary)' : 'var(--border)'}`,
                        background: activo ? 'var(--primary-light)' : '#ffffff',
                        color: activo ? 'var(--primary)' : 'var(--text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={16} />
                      <span>{mp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vuelto si es efectivo */}
            {metodoPago === 'Efectivo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Monto Recibido S/</label>
                  <input
                    type="number"
                    step="0.50"
                    placeholder={`Min. ${total}`}
                    className="form-control"
                    style={{ padding: '0.45rem 0.65rem', fontWeight: 700 }}
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Vuelto a entregar</label>
                  <div style={{ padding: '0.45rem 0.65rem', background: '#f1f5f9', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                    S/ {vuelto.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Resumen Total & Botón de Cobro */}
            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total a Cobrar:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>

              <button
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                onClick={handleCobrar}
                disabled={carrito.length === 0 || procesando}
              >
                <Check size={20} />
                <span>{procesando ? 'Procesando Venta y Stock...' : 'Emitir Boleta / Cobrar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ticket de Venta Térmico */}
      {ventaExitosa && (
        <TicketModal
          venta={ventaExitosa}
          onClose={() => setVentaExitosa(null)}
        />
      )}
    </div>
  );
};

export default POSPage;

