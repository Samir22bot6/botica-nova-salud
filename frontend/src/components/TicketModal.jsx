import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';

const TicketModal = ({ venta, onClose }) => {
  if (!venta) return null;

  const handlePrint = () => {
    window.print();
  };

  const fechaFormat = new Date(venta.fecha || Date.now()).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del Modal (No se imprime) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="modal-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <CheckCircle size={22} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>Venta Procesada</span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* TICKET DE VENTA (ESTILO TÉRMICO) */}
        <div className="ticket-wrapper">
          <div className="ticket-header">
            <h2 style={{ fontSize: '16px', fontWeight: 800 }}>BOTICA NOVA SALUD</h2>
            <div style={{ fontSize: '11px', color: '#444' }}>FarmaPlus S.A.C.</div>
            <div style={{ fontSize: '11px' }}>R.U.C. 20601234567</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>Av. La Marina 1254, Lima - Perú</div>
            <div style={{ fontSize: '10px' }}>Telf: (01) 456-7890 / 987-654-321</div>
            <div className="ticket-divider"></div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>BOLETA DE VENTA ELECTRÓNICA</div>
            <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>
              {venta.numeroComprobante}
            </div>
          </div>

          <div style={{ fontSize: '11px', marginBottom: '8px' }}>
            <div><strong>Fecha/Hora:</strong> {fechaFormat}</div>
            <div><strong>Cliente:</strong> {venta.cliente?.nombre || 'PÚBLICO GENERAL'}</div>
            <div><strong>Doc (DNI/RUC):</strong> {venta.cliente?.documento || '00000000'}</div>
            <div><strong>Cajero:</strong> {venta.vendedor || 'Cajero Nova Salud'}</div>
          </div>

          <div className="ticket-divider"></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 0.6fr 0.8fr 0.8fr', fontWeight: 700, fontSize: '11px', marginBottom: '6px' }}>
            <span>DESCRIPCIÓN</span>
            <span style={{ textAlign: 'center' }}>CANT</span>
            <span style={{ textAlign: 'right' }}>P.U.</span>
            <span style={{ textAlign: 'right' }}>TOTAL</span>
          </div>

          <div className="ticket-divider" style={{ margin: '4px 0 8px 0' }}></div>

          {venta.productos?.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '6px', fontSize: '11px' }}>
              <div style={{ fontWeight: 600 }}>{item.nombre}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '10px' }}>
                <span>Lote: {item.lote || 'N/A'}</span>
                <span>{item.cantidad} x S/ {Number(item.precioUnitario).toFixed(2)} = <strong>S/ {Number(item.subtotal).toFixed(2)}</strong></span>
              </div>
            </div>
          ))}

          <div className="ticket-divider"></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
            <div className="ticket-row">
              <span>OP. GRAVADA:</span>
              <span>S/ {(venta.total / 1.18).toFixed(2)}</span>
            </div>
            <div className="ticket-row">
              <span>I.G.V. (18%):</span>
              <span>S/ {(venta.total - (venta.total / 1.18)).toFixed(2)}</span>
            </div>
            <div className="ticket-row" style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px' }}>
              <span>TOTAL A PAGAR:</span>
              <span>S/ {Number(venta.total).toFixed(2)}</span>
            </div>
            <div className="ticket-row" style={{ color: '#444' }}>
              <span>MÉTODO DE PAGO:</span>
              <span>{venta.metodoPago}</span>
            </div>
            {venta.metodoPago === 'Efectivo' && (
              <>
                <div className="ticket-row" style={{ color: '#444' }}>
                  <span>MONTO RECIBIDO:</span>
                  <span>S/ {Number(venta.montoRecibido || venta.total).toFixed(2)}</span>
                </div>
                <div className="ticket-row" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  <span>VUELTO:</span>
                  <span>S/ {Number(venta.vuelto || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="ticket-divider"></div>

          <div style={{ textAlign: 'center', fontSize: '10px', color: '#555', marginTop: '10px' }}>
            <div>¡Gracias por su compra en Nova Salud!</div>
            <div>Conserve este comprobante ante cualquier consulta.</div>
            <div style={{ marginTop: '4px', letterSpacing: '2px', fontWeight: 700 }}>
              * * * * * * * * * * * *
            </div>
          </div>
        </div>

        {/* Acciones de Modal */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }} className="modal-actions">
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-primary" style={{ flex: 1.5 }} onClick={handlePrint}>
            <Printer size={18} />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;

