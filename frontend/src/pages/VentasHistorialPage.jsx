import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, Eye, Printer, ShoppingBag } from 'lucide-react';
import api from '../api/axiosClient';
import TicketModal from '../components/TicketModal';

const VentasHistorialPage = () => {
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState({ totalVentas: 0, totalRecaudado: 0 });
  const [cargando, setCargando] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const res = await api.get('/ventas?limit=100');
      setVentas(res.data.ventas || []);
      setResumen({
        totalVentas: res.data.totalVentas || 0,
        totalRecaudado: res.data.totalRecaudado || 0,
      });
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Historial de Ventas & Comprobantes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Registro cronológico de boletas emitidas, recaudación y reimpresión de tickets.
          </p>
        </div>

        <button className="btn-secondary" onClick={cargarVentas}>
          Refrescar Historial
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPROBANTES EMITIDOS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{resumen.totalVentas}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>RECAUDACIÓN TOTAL ACUMULADA</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
              S/ {Number(resumen.totalRecaudado).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Doc. Identidad</th>
                <th>Método de Pago</th>
                <th>Items</th>
                <th>Total S/.</th>
                <th>Cajero</th>
                <th style={{ textAlign: 'right' }}>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No hay ventas registradas en el sistema aún.
                  </td>
                </tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {v.numeroComprobante}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {new Date(v.fecha).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{v.cliente?.nombre || 'PÚBLICO GENERAL'}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        {v.cliente?.documento || '00000000'}
                      </span>
                    </td>
                    <td>
                      <span className="product-badge badge-blue">{v.metodoPago}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{v.productos?.length || 0} medicamentos</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                        S/ {Number(v.total).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {v.vendedor || 'Cajero'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => setVentaSeleccionada(v)}
                        title="Ver e imprimir ticket"
                      >
                        <Printer size={15} />
                        <span>Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ticket Térmico */}
      {ventaSeleccionada && (
        <TicketModal
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  );
};

export default VentasHistorialPage;

