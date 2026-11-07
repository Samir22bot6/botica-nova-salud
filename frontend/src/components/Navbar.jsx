import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  FileText, 
  Activity, 
  ShieldCheck, 
  User, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab, alertasCount, onRefresh }) => {
  const { usuario, switchRole } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('pos')}>
          <div className="brand-icon">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="brand-title">Nova Salud</div>
            <div className="brand-subtitle">FarmaPlus • SENATI POS</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-tab ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            <ShoppingCart size={18} />
            <span>Punto de Venta (POS)</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'inventario' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventario')}
          >
            <Package size={18} />
            <span>Control Inventario</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <AlertTriangle size={18} />
            <span>Panel de Alertas</span>
            {alertasCount > 0 && (
              <span className="badge-alert">{alertasCount}</span>
            )}
          </button>

          <button
            className={`nav-tab ${activeTab === 'ventas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ventas')}
          >
            <FileText size={18} />
            <span>Historial Ventas</span>
          </button>
        </nav>

        {/* User Controls & Role Switcher */}
        <div className="user-controls">
          <button
            className="btn-secondary"
            onClick={onRefresh}
            title="Sincronizar datos con MongoDB"
            style={{ padding: '0.45rem 0.65rem' }}
          >
            <RefreshCw size={15} />
          </button>

          <div className="role-tag">
            <ShieldCheck size={16} color="var(--primary)" />
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                {usuario?.rol || 'Cajero'}
              </span>
            </div>
            {/* Selector de rol para evaluar permisos */}
            <select
              value={usuario?.rol || 'Cajero'}
              onChange={(e) => switchRole(e.target.value)}
              style={{
                marginLeft: '0.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="Cambiar rol para pruebas académicas"
            >
              <option value="Admin">Admin</option>
              <option value="Farmacéutico">Farmacéutico</option>
              <option value="Cajero">Cajero</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

