import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Tag, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import api from '../api/axiosClient';
import Cart from './Cart';
import TicketModal from './TicketModal';
import { useAuth } from '../context/AuthContext';

const POS = ({ productos = [], onVentaRealizada }) => {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [carrito, setCarrito] = useState([]);

  // Datos del Cliente para el comprobante
  const [cliente, setCliente] = useState({
    nombre: 'PÚBLICO GENERAL',
    documento: '00000000',
    telefono: '',
  });

  // Métodos de pago y estado de cobro
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

  // Filtrado reactivo de medicamentos
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

  // Manejo del carrito
  const agregarAlCarrito = (producto) => {
    setErrorVenta('');
    const itemExistente = carrito.find((i) => i.productoId === producto._id);

    if (itemExistente) {
      if (itemExistente.cantidad + 1 > producto.stockActual) {
        setErrorVenta(`Stock insuficiente de ${producto.nombre} (Disponible: ${producto.stockActual})`);
        return;
      }
      setCarrito(
        carrito.map((i) =>
          i.productoId === producto._id
            ? {
                ...i,
                cantidad: i.cantidad + 1,
                subtotal: Number(((i.cantidad + 1) * i.precioUnitario).toFixed(2)),
              }
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

  // Procesar venta y cobro en POS
  const handleCobrar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorVenta('');

    if (carrito.length === 0) {
      setErrorVenta('El carrito está vacío. Agregue medicamentos para emitir la boleta.');
      return;
    }

    const totalVenta = Number(carrito.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));

    if (metodoPago === 'Efectivo' && montoRecibido && Number(montoRecibido) < totalVenta) {
      setErrorVenta(`El monto recibido (S/ ${montoRecibido}) es menor al total a pagar (S/ ${totalVenta}).`);
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
        montoRecibido: metodoPago === 'Efectivo' ? Number(montoRecibido) || totalVenta : totalVenta,
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
    <div className="w-full">
      {/* Encabezado del Módulo */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Punto de Venta (POS) & Atención en Mostrador
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Búsqueda ágil de medicamentos, control de lotes y facturación electrónica instantánea.
        </p>
      </div>

      {/* Grid Principal del POS Requerido: grid grid-cols-1 lg:grid-cols-12 gap-6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SECCIÓN CATÁLOGO: lg:col-span-7 */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Buscador de Medicamentos */}
          <div className="flex items-center gap-3 bg-white border-2 border-slate-200 focus-within:border-emerald-600 rounded-xl px-4 py-3 shadow-sm transition-all">
            <Search size={20} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre, laboratorio (Bagó, Portugal, Bayer) o lote..."
              className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-slate-400"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros de Categorías en Píldoras Horizontales */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  categoriaSeleccionada === cat
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catálogo de Productos */}
          {productosFiltrados.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center">
              <AlertCircle size={40} className="text-amber-500 mb-2 opacity-80" />
              <p className="font-semibold text-gray-700">No se encontraron medicamentos</p>
              <p className="text-xs text-slate-400 mt-1">Pruebe con otro término de búsqueda o categoría.</p>
              <button
                type="button"
                onClick={() => { setBusqueda(''); setCategoriaSeleccionada('Todas'); }}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {productosFiltrados.map((prod) => {
                const stockBajo = prod.stockActual <= prod.stockMinimo;
                const agotado = prod.stockActual <= 0;
                const enCarrito = carrito.find((i) => i.productoId === prod._id);

                return (
                  <div
                    key={prod._id}
                    className="bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            agotado
                              ? 'bg-rose-100 text-rose-700'
                              : stockBajo
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {agotado ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'En Stock'}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-slate-500">
                          Lote: {prod.lote}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">
                        {prod.nombre}
                      </h3>

                      <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-slate-400" />
                          <span className="truncate">{prod.laboratorio} • {prod.categoria}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate">{prod.ubicacion || 'Estante General'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          Stock: <strong className={agotado ? 'text-rose-600' : 'text-slate-700'}>{prod.stockActual}</strong> unid.
                        </div>
                        <div className="text-lg font-black text-emerald-600">
                          S/ {Number(prod.precioVenta).toFixed(2)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => agregarAlCarrito(prod)}
                        disabled={agotado}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={15} />
                        <span>{enCarrito ? `(${enCarrito.cantidad}) Agregar` : 'Agregar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECCIÓN CARRITO POS: lg:col-span-5 */}
        <div className="lg:col-span-5">
          <Cart
            carrito={carrito}
            cliente={cliente}
            setCliente={setCliente}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            montoRecibido={montoRecibido}
            setMontoRecibido={setMontoRecibido}
            onUpdateQty={modificarCantidad}
            onRemoveItem={eliminarDelCarrito}
            onClearCart={vaciarCarrito}
            onCobrar={handleCobrar}
            procesando={procesando}
            error={errorVenta}
          />
        </div>
      </div>

      {/* Modal de Comprobante / Ticket Térmico */}
      {ventaExitosa && (
        <TicketModal
          venta={ventaExitosa}
          onClose={() => setVentaExitosa(null)}
        />
      )}
    </div>
  );
};

export default POS;
