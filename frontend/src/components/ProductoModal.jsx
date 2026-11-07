import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const CATEGORIAS_DEFAULT = [
  'Analgésicos',
  'Antiinflamatorios',
  'Antibióticos',
  'Antihistamínicos',
  'Gastroenterología',
  'Cardiovascular',
  'Vitaminas y Suplementos',
  'Cuidado Personal y Primeros Auxilios',
  'Dispositivos Médicos',
  'Pediatría',
];

const LABORATORIOS_DEFAULT = [
  'Laboratorios Portugal',
  'Genfar',
  'Medifarma',
  'Laboratorios Bagó',
  'Bayer',
  'Farmindustria',
  'Alkofarma',
  'Roemmers',
  'Sanitas',
  'Omron',
];

const ProductoModal = ({ producto, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    laboratorio: 'Laboratorios Portugal',
    lote: '',
    fechaVencimiento: '',
    categoria: 'Analgésicos',
    stockActual: 10,
    stockMinimo: 5,
    precioVenta: 10.0,
    ubicacion: 'Estante General',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        laboratorio: producto.laboratorio || 'Laboratorios Portugal',
        lote: producto.lote || '',
        fechaVencimiento: producto.fechaVencimiento
          ? new Date(producto.fechaVencimiento).toISOString().split('T')[0]
          : '',
        categoria: producto.categoria || 'Analgésicos',
        stockActual: producto.stockActual ?? 10,
        stockMinimo: producto.stockMinimo ?? 5,
        precioVenta: producto.precioVenta ?? 10.0,
        ubicacion: producto.ubicacion || 'Estante General',
      });
    } else {
      // Default para nuevo producto
      const anio = new Date().getFullYear();
      setFormData({
        nombre: '',
        laboratorio: 'Laboratorios Portugal',
        lote: `LT-${anio}-01`,
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        categoria: 'Analgésicos',
        stockActual: 20,
        stockMinimo: 5,
        precioVenta: 12.5,
        ubicacion: 'Estante A1',
      });
    }
    setError('');
  }, [producto, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError('El nombre del medicamento es obligatorio.');
      return;
    }
    if (!formData.lote.trim()) {
      setError('El número de lote es obligatorio.');
      return;
    }
    if (!formData.fechaVencimiento) {
      setError('La fecha de vencimiento es obligatoria.');
      return;
    }
    if (Number(formData.stockActual) < 0) {
      setError('El stock actual no puede ser negativo.');
      return;
    }
    if (Number(formData.precioVenta) <= 0) {
      setError('El precio de venta debe ser mayor a 0.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        stockActual: Number(formData.stockActual),
        stockMinimo: Number(formData.stockMinimo),
        precioVenta: Number(formData.precioVenta),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el medicamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {producto ? 'Editar Medicamento' : 'Registrar Nuevo Medicamento / Lote'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Complete los datos farmacéuticos para el control de inventario y dispensación.
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Comercial / Genérico del Medicamento *</label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              placeholder="Ej: Amoxicilina 500mg, Paracetamol jarabe..."
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Laboratorio Fabricante *</label>
              <select
                name="laboratorio"
                className="form-control"
                value={formData.laboratorio}
                onChange={handleChange}
              >
                {LABORATORIOS_DEFAULT.map((lab) => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Categoría Farmacológica *</label>
              <select
                name="categoria"
                className="form-control"
                value={formData.categoria}
                onChange={handleChange}
              >
                {CATEGORIAS_DEFAULT.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Número de Lote *</label>
              <input
                type="text"
                name="lote"
                className="form-control"
                placeholder="Ej: LP-2026-09A"
                value={formData.lote}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha de Vencimiento *</label>
              <input
                type="date"
                name="fechaVencimiento"
                className="form-control"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Stock Inicial / Actual *</label>
              <input
                type="number"
                name="stockActual"
                className="form-control"
                min="0"
                value={formData.stockActual}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Mínimo (Alerta) *</label>
              <input
                type="number"
                name="stockMinimo"
                className="form-control"
                min="1"
                value={formData.stockMinimo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Precio Venta (S/.) *</label>
              <input
                type="number"
                step="0.10"
                name="precioVenta"
                className="form-control"
                min="0.1"
                value={formData.precioVenta}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación Física en Almacén / Mostrador</label>
            <input
              type="text"
              name="ubicacion"
              className="form-control"
              placeholder="Ej: Estante A2 - Gaveta 3"
              value={formData.ubicacion}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Guardando...' : (producto ? 'Actualizar' : 'Guardar Medicamento')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoModal;

