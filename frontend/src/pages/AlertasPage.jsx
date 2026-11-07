import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  PackageX, 
  TrendingDown, 
  Check, 
  RefreshCw, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../api/axiosClient';

const AlertasPage = ({ onRefresh }) => {
  const [alertasData, setAlertasData] = useState({
    totalAlertas: 0,
    resumen: {
      stockBajoCount: 0,
      agotadosCount: 0,
      proximosVencerCount: 0,
      yaVencidosCount: 0,
    },
    alertas: {
      stockBajo: [],
      proximosVencer: [],
    },
  });
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('todas'); // 'todas', 'stock', 'vencimiento'
  const [reabasteciendoId, setReabasteciendoId] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');

  const cargarAlertas = async () => {
    setCargando(true);
    try {
      const res = await api.get('/productos/alertas');
      setAlertasData(res.data);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const handleReabastecer = async (id, cantidad = 20) => {
    setReabasteciendoId(id);
    setMensajeExito('');
    try {
      await api.patch(`/productos/${id}/stock`, { cantidad });
      setMensajeExito(`Stock incrementado en +${cantidad} unidades exitosamente.`);
      await cargarAlertas();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error al reabastecer stock');
    } finally {
      setReabasteciendoId(null);
    }
  };

  const hoy = new Date();

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)', animation: 'pulse-badge 2s infinite' }}></div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Panel de Alertas y Control de Reorden</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitoreo en tiempo real de medicamentos críticos con quiebre de stock y lotes próximos a vencer.
          </p>
        </div>

        <button className="btn-secondary" onClick={cargarAlertas} disabled={cargando}>
          <RefreshCw size={16} className={cargando ? 'spin' : ''} />
          <span>Actualizar Alertas</span>
        </button>
      </div>

      {mensajeExito && (
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{mensajeExito}</span>
          <button onClick={() => setMensajeExito('')}>✕</button>
        </div>
      )}

      {/* Tarjetas Estadísticas de Alerta */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL ALERTAS</span>
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>
            {alertasData.totalAlertas}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Atención prioritaria requerida
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>STOCK BAJO / REORDEN</span>
            <TrendingDown size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>
            {alertasData.resumen?.stockBajoCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Stock actual &le; Stock mínimo
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #b91c1c', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>STOCK AGOTADO (0)</span>
            <PackageX size={20} color="#b91c1c" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b91c1c' }}>
            {alertasData.resumen?.agotadosCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Desabastecimiento total
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRÓXIMOS A VENCER</span>
            <Clock size={20} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>
            {alertasData.resumen?.proximosVencerCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Vencimiento dentro de 60 días
          </div>
        </div>
      </div>

      {/* Pestañas de filtrado de alertas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`nav-tab ${pestanaActiva === 'todas' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('todas')}
        >
          Todas las Alertas ({alertasData.totalAlertas})
        </button>
        <button
          className={`nav-tab ${pestanaActiva === 'stock' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('stock')}
        >
          Stock Bajo / Reorden ({alertasData.resumen?.stockBajoCount || 0})
        </button>
        <button
          className={`nav-tab ${pestanaActiva === 'vencimiento' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('vencimiento')}
        >
          Próximos a Vencer ({alertasData.resumen?.proximosVencerCount || 0})
        </button>
      </div>

      {/* SECCIÓN 1: MEDICAMENTOS CON STOCK BAJO / REORDEN */}
      {(pestanaActiva === 'todas' || pestanaActiva === 'stock') && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <TrendingDown size={20} color="var(--danger)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Medicamentos con Stock Bajo o Reorden Necesario (Stock &le; Mínimo)
            </h2>
          </div>

          {alertasData.alertas?.stockBajo?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--primary)' }}>
              <Check size={28} style={{ margin: '0 auto 0.25rem auto' }} />
              <p style={{ fontWeight: 600 }}>¡Excelente! Todos los medicamentos cuentan con stock superior al mínimo.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Laboratorio</th>
                    <th>Lote</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado</th>
                    <th>Ubicación</th>
                    <th style={{ textAlign: 'right' }}>Acción de Reorden</th>
                  </tr>
                </thead>
                <tbody>
                  {alertasData.alertas?.stockBajo?.map((p) => {
                    const agotado = p.stockActual === 0;
                    return (
                      <tr key={p._id} style={{ background: agotado ? '#fff1f2' : '#fffbeb' }}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.categoria}</div>
                        </td>
                        <td>{p.laboratorio}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{p.lote}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: agotado ? 'var(--danger)' : 'var(--warning)' }}>
                            {p.stockActual}
                          </span>
                        </td>
                        <td>{p.stockMinimo} unidades</td>
                        <td>
                          <span className={`product-badge ${agotado ? 'badge-red' : 'badge-amber'}`}>
                            {agotado ? 'AGOTADO' : 'STOCK CRÍTICO'}
                          </span>
                        </td>
                        <td>{p.ubicacion || 'Almacén'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleReabastecer(p._id, 20)}
                            disabled={reabasteciendoId === p._id}
                          >
                            <span>{reabasteciendoId === p._id ? 'Reordenando...' : '+20 Reabastecer'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 2: MEDICAMENTOS PRÓXIMOS A VENCER */}
      {(pestanaActiva === 'todas' || pestanaActiva === 'vencimiento') && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <Clock size={20} color="#7c3aed" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Medicamentos Próximos a Vencer o Vencidos (Alerta Sanitaria)
            </h2>
          </div>

          {alertasData.alertas?.proximosVencer?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--primary)' }}>
              <Check size={28} style={{ margin: '0 auto 0.25rem auto' }} />
              <p style={{ fontWeight: 600 }}>No hay medicamentos que venzan en los próximos 60 días.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Laboratorio</th>
                    <th>Lote</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Días Restantes</th>
                    <th>Stock en Riesgo</th>
                    <th>Condición</th>
                  </tr>
                </thead>
                <tbody>
                  {alertasData.alertas?.proximosVencer?.map((p) => {
                    const diffDias = p.fechaVencimiento
                      ? Math.ceil((new Date(p.fechaVencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                      : 0;
                    const vencido = diffDias <= 0;

                    return (
                      <tr key={p._id} style={{ background: vencido ? '#fef2f2' : '#faf5ff' }}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.categoria}</div>
                        </td>
                        <td>{p.laboratorio}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{p.lote}</span>
                        </td>
                        <td>
                          <strong>
                            {new Date(p.fechaVencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: vencido ? 'var(--danger)' : '#7c3aed' }}>
                            {vencido ? `Venció hace ${Math.abs(diffDias)} días` : `Faltan ${diffDias} días`}
                          </span>
                        </td>
                        <td>
                          <strong>{p.stockActual}</strong> unidades
                        </td>
                        <td>
                          <span className={`product-badge ${vencido ? 'badge-red' : 'badge-amber'}`}>
                            {vencido ? 'VENCIDO - RETIRAR' : 'PRÓXIMO A VENCER'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertasPage;

