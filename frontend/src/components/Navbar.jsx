import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  FileText, 
  Activity, 
  ShieldCheck, 
  User, 
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab, alertasCount, onRefresh }) => {
  const { usuario, logout, demoLogin } = useAuth();

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
                {usuario?.nombre || 'Usuario'}
              </span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                usuario?.rol === 'Admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-sky-100 text-sky-800'
              }`}>
                {usuario?.rol || 'Cajero'}
              </span>
            </div>
            {/* Selector de alternancia rápida para evaluación */}
            <select
              value={usuario?.rol || 'Cajero'}
              onChange={(e) => demoLogin(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-500 font-semibold cursor-pointer outline-none ml-1"
              title="Cambiar sesión para evaluar permisos"
            >
              <option value="Admin">Admin</option>
              <option value="Cajero">Cajero</option>
            </select>
          </div>

          <button
            onClick={logout}
            className="btn-secondary text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            title="Cerrar sesión"
            style={{ padding: '0.45rem 0.65rem' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

