import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  ArrowUpDown, 
  Filter, 
  Package, 
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../api/axiosClient';
import ProductoModal from '../components/ProductoModal';
import { useAuth } from '../context/AuthContext';

const InventarioPage = ({ productos, onRefresh }) => {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroLaboratorio, setFiltroLaboratorio] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  
  // Modal de Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);

  // Extracción de laboratorios y categorías únicas
  const laboratorios = useMemo(() => {
    const setLabs = new Set(productos.map((p) => p.laboratorio).filter(Boolean));
    return ['Todos', ...Array.from(setLabs)];
  }, [productos]);

  const categorias = useMemo(() => {
    const setCats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return ['Todas', ...Array.from(setCats)];
  }, [productos]);

  // Filtrado reactivo de la tabla
  const productosFiltrados = useMemo(() => {
    const hoy = new Date();
    const limite60dias = new Date();
    limite60dias.setDate(hoy.getDate() + 60);

    return productos.filter((p) => {
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.laboratorio.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.lote.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase());

      const matchCat =
        filtroCategoria === 'Todas' || p.categoria === filtroCategoria;

      const matchLab =
        filtroLaboratorio === 'Todos' || p.laboratorio === filtroLaboratorio;

      let matchEstado = true;
      if (filtroEstado === 'stock_bajo') {
        matchEstado = p.stockActual <= p.stockMinimo;
      } else if (filtroEstado === 'por_vencer') {
        matchEstado = new Date(p.fechaVencimiento) <= limite60dias;
      } else if (filtroEstado === 'normal') {
        matchEstado = p.stockActual > p.stockMinimo && new Date(p.fechaVencimiento) > limite60dias;
      }

      return matchBusqueda && matchCat && matchLab && matchEstado;
    });
  }, [productos, busqueda, filtroCategoria, filtroLaboratorio, filtroEstado]);

  // Control de permisos según Rol (Ocultar crear/editar/eliminar si es Cajero)
  const esAdmin = usuario?.rol === 'Admin';

  // Guardar (Crear o Actualizar)
  const handleGuardarProducto = async (data) => {
    if (productoSeleccionado) {
      await api.put(`/productos/${productoSeleccionado._id}`, data);
      setMensaje({ tipo: 'success', texto: 'Medicamento actualizado correctamente.' });
    } else {
      await api.post('/productos', data);
      setMensaje({ tipo: 'success', texto: 'Nuevo lote/medicamento registrado con éxito.' });
    }
    if (onRefresh) onRefresh();
  };

  // Eliminar
  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el medicamento "${nombre}" del inventario?`)) {
      return;
    }
    try {
      await api.delete(`/productos/${id}`);
      setMensaje({ tipo: 'success', texto: `"${nombre}" eliminado del catálogo.` });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al eliminar el producto.' });
    }
  };

  // Ajuste rápido de stock (+ / -)
  const handleAjusteStock = async (id, cantidadDelta) => {
    try {
      await api.patch(`/productos/${id}/stock`, { cantidad: cantidadDelta });
      if (onRefresh) onRefresh();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al ajustar stock.' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Control de Inventario Farmacéutico</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro de lotes, control de existencias, fechas de vencimiento y ubicación en botica.
          </p>
        </div>

        {esAdmin ? (
          <button
            className="btn-primary"
            onClick={() => {
              setProductoSeleccionado(null);
              setModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Registrar Nuevo Medicamento / Lote</span>
          </button>
        ) : (
          <div className="bg-slate-100 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <span>Modo Lectura (Gestión de Lotes exclusiva para Administrador)</span>
          </div>
        )}
      </div>

      {/* Alertas / Mensajes de operación */}
      {mensaje.texto && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            background: mensaje.tipo === 'success' ? 'var(--primary-light)' : 'var(--danger-light)',
            color: mensaje.tipo === 'success' ? 'var(--primary)' : 'var(--danger)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje({ tipo: '', texto: '' })}>✕</button>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Búsqueda Rápida</label>
            <div className="catalog-search-bar" style={{ marginBottom: 0, padding: '0.5rem 0.75rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Nombre, lote, laboratorio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Filtrar por Laboratorio</label>
            <select
              className="form-control"
              value={filtroLaboratorio}
              onChange={(e) => setFiltroLaboratorio(e.target.value)}
            >
              {laboratorios.map((lab) => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Filtrar por Categoría</label>
            <select
              className="form-control"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Estado de Stock</label>
            <select
              className="form-control"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="normal">Stock Normal</option>
              <option value="stock_bajo">Stock Bajo / Crítico</option>
              <option value="por_vencer">Próximo a Vencer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Interactiva de Inventario */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Medicamento & Categoría</th>
                <th>Laboratorio</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Stock Actual / Mín.</th>
                <th>Precio Venta</th>
                <th>Ubicación</th>
                <th style={{ textAlign: 'center' }}>Ajuste Rápido</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No se encontraron productos que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((p) => {
                  const esStockBajo = p.stockActual <= p.stockMinimo;
                  const esAgotado = p.stockActual <= 0;
                  const hoy = new Date();
                  const diasParaVencer = p.fechaVencimiento
                    ? Math.ceil((new Date(p.fechaVencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                    : 999;
                  const esPorVencer = diasParaVencer <= 60;
                  const esVencido = diasParaVencer <= 0;

                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {p.nombre}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {p.categoria}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600 }}>{p.laboratorio}</span>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {p.lote}
                        </span>
                      </td>

                      <td>
                        <div>
                          {p.fechaVencimiento
                            ? new Date(p.fechaVencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : 'N/A'}
                        </div>
                        {esVencido ? (
                          <span className="product-badge badge-red" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
                            VENCIDO
                          </span>
                        ) : esPorVencer ? (
                          <span className="product-badge badge-amber" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
                            Vence en {diasParaVencer}d
                          </span>
                        ) : null}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: esAgotado ? 'var(--danger)' : esStockBajo ? 'var(--warning)' : 'inherit',
                            }}
                          >
                            {p.stockActual}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            / mín {p.stockMinimo}
                          </span>
                        </div>
                        {esAgotado ? (
                          <span className="product-badge badge-red" style={{ fontSize: '0.65rem' }}>Agotado</span>
                        ) : esStockBajo ? (
                          <span className="product-badge badge-amber" style={{ fontSize: '0.65rem' }}>Stock Bajo</span>
                        ) : (
                          <span className="product-badge badge-green" style={{ fontSize: '0.65rem' }}>Óptimo</span>
                        )}
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                          S/ {Number(p.precioVenta).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <MapPin size={13} />
                          <span>{p.ubicacion || 'General'}</span>
                        </div>
                      </td>

                      {/* Botones de Ajuste Rápido de Stock (+5 / +1 / -1) */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                          <button
                            className="qty-btn"
                            title="Restar 1 unidad"
                            onClick={() => handleAjusteStock(p._id, -1)}
                            disabled={p.stockActual <= 0}
                          >
                            -1
                          </button>
                          <button
                            className="qty-btn"
                            title="Sumar 1 unidad"
                            onClick={() => handleAjusteStock(p._id, 1)}
                          >
                            +1
                          </button>
                          <button
                            className="qty-btn"
                            style={{ width: 'auto', padding: '0 6px', fontSize: '0.75rem' }}
                            title="Sumar 10 unidades (Reabastecer)"
                            onClick={() => handleAjusteStock(p._id, 10)}
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Acciones Editar y Eliminar (Solo visibles y permitidas para Admin) */}
                      <td style={{ textAlign: 'right' }}>
                        {esAdmin ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Editar Medicamento (Admin)"
                              onClick={() => {
                                setProductoSeleccionado(p);
                                setModalOpen(true);
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-danger"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Eliminar del Catálogo (Admin)"
                              onClick={() => handleEliminar(p._id, p.nombre)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Solo Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar */}
      <ProductoModal
        producto={productoSeleccionado}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setProductoSeleccionado(null);
        }}
        onSave={handleGuardarProducto}
      />
    </div>
  );
};

export default InventarioPage;

