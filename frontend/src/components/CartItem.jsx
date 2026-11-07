import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQty, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors gap-2">
      {/* Información del Producto */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-medium text-sm text-gray-800 break-words leading-tight">
          {item.nombre}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <span>P.U: S/ {Number(item.precioUnitario).toFixed(2)}</span>
          {item.lote && (
            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {item.lote}
            </span>
          )}
        </div>
      </div>

      {/* Controles de Cantidad (+ / -) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onUpdateQty(item.productoId, -1)}
          className="w-7 h-7 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold transition-colors disabled:opacity-50"
          title="Disminuir cantidad"
        >
          <Minus size={13} />
        </button>

        <span className="w-6 text-center font-bold text-sm text-gray-900">
          {item.cantidad}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQty(item.productoId, 1)}
          disabled={item.stockDisponible && item.cantidad >= item.stockDisponible}
          className="w-7 h-7 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold transition-colors disabled:opacity-40"
          title="Aumentar cantidad"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Subtotal y Botón Eliminar */}
      <div className="text-right shrink-0 min-w-[70px] pl-1">
        <div className="font-extrabold text-sm text-emerald-700">
          S/ {Number(item.subtotal).toFixed(2)}
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.productoId)}
          className="text-rose-500 hover:text-rose-700 p-1 rounded inline-flex items-center text-xs gap-0.5 transition-colors mt-0.5"
          title="Eliminar del carrito"
        >
          <Trash2 size={13} />
          <span className="text-[11px]">Quitar</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
