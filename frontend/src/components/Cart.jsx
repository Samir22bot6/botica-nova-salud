import React from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Smartphone, 
  CreditCard 
} from 'lucide-react';
import CartItem from './CartItem';

const METODOS_PAGO = [
  { id: 'Efectivo', label: 'Efectivo', icon: DollarSign },
  { id: 'Yape', label: 'Yape QR', icon: Smartphone },
  { id: 'Plin', label: 'Plin QR', icon: Smartphone },
  { id: 'Tarjeta', label: 'Tarjeta POS', icon: CreditCard },
];

const Cart = ({
  carrito,
  cliente,
  setCliente,
  metodoPago,
  setMetodoPago,
  montoRecibido,
  setMontoRecibido,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCobrar,
  procesando,
  error,
}) => {
  const total = Number(carrito.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));
  const recibido = Number(montoRecibido);
  const vuelto = metodoPago === 'Efectivo' && recibido >= total
    ? Number((recibido - total).toFixed(2))
    : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-20 flex flex-col gap-4 min-w-[360px]">
      {/* Encabezado del Carrito */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-emerald-600" size={20} />
          <h3 className="font-extrabold text-base text-gray-900">Carrito de Venta</h3>
          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
            {carrito.length}
          </span>
        </div>

        {carrito.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={13} />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* Alerta de Error en Venta */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de Medicamentos en el Carrito con Scroll */}
      <div className="max-h-[320px] overflow-y-auto p-1 flex flex-col gap-2">
        {carrito.length === 0 ? (
          <div className="text-center py-8 text-slate-400 flex flex-col items-center">
            <ShoppingBag size={36} className="opacity-40 mb-2" />
            <p className="text-sm font-medium">El carrito está vacío</p>
            <p className="text-xs text-slate-400 mt-1">Haga clic en "+ Agregar" sobre cualquier medicamento</p>
          </div>
        ) : (
          carrito.map((item) => (
            <CartItem
              key={item.productoId}
              item={item}
              onUpdateQty={onUpdateQty}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* Datos del Cliente para el Comprobante */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Cliente (Boleta / Factura)
        </span>
        <div className="grid grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="DNI / RUC"
            className="col-span-2 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={cliente.documento}
            onChange={(e) => setCliente({ ...cliente, documento: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nombre / Razón Social"
            className="col-span-3 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={cliente.nombre}
            onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
          />
        </div>
      </div>

      {/* Métodos de Pago en Cuadrícula Equilibrada */}
      <div>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
          Método de Pago
        </span>
        <div className="grid grid-cols-2 gap-2">
          {METODOS_PAGO.map((mp) => {
            const Icon = mp.icon;
            const activo = metodoPago === mp.id;
            return (
              <button
                key={mp.id}
                type="button"
                onClick={() => setMetodoPago(mp.id)}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activo
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={15} className={activo ? 'text-emerald-600' : 'text-slate-400'} />
                <span>{mp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control de Monto Recibido y Vuelto si Efectivo */}
      {metodoPago === 'Efectivo' && (
        <div className="grid grid-cols-2 gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Monto Recibido S/
            </label>
            <input
              type="number"
              step="0.50"
              placeholder={`Min. ${total}`}
              className="w-full px-2.5 py-1.5 text-sm font-extrabold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              value={montoRecibido}
              onChange={(e) => setMontoRecibido(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Vuelto a entregar
            </label>
            <div className="px-2.5 py-1.5 bg-white border border-emerald-200 rounded-md text-sm font-extrabold text-emerald-700 flex items-center h-[38px]">
              S/ {vuelto.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Resumen Total y Botón de Emisión */}
      <div className="pt-3 border-t border-dashed border-slate-300 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total de la Venta</span>
            <span className="text-[11px] text-slate-400">Incluye I.G.V. (18%)</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            S/ {total.toFixed(2)}
          </div>
        </div>

        <button
          type="button"
          onClick={onCobrar}
          disabled={carrito.length === 0 || procesando}
          className="w-full py-3 px-4 flex items-center justify-center gap-2 text-base font-bold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={20} />
          <span>{procesando ? 'Procesando Venta...' : 'Emitir Boleta / Cobrar'}</span>
        </button>
      </div>
    </div>
  );
};

export default Cart;
