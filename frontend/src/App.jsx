import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import POSPage from './pages/POSPage';
import InventarioPage from './pages/InventarioPage';
import AlertasPage from './pages/AlertasPage';
import VentasHistorialPage from './pages/VentasHistorialPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api/axiosClient';
import { useAuth } from './context/AuthContext';
import { Database, ShieldCheck } from 'lucide-react';

function App() {
  const { isAuthenticated, usuario } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  const [productos, setProductos] = useState([]);
  const [alertasCount, setAlertasCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [seedStatus, setSeedStatus] = useState('');

  // Carga global de productos e inventario
  const cargarDatos = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setDbError(null);
      const [resProd, resAlertas] = await Promise.all([
        api.get('/productos'),
        api.get('/productos/alertas'),
      ]);

      setProductos(resProd.data.productos || []);
      setAlertasCount(resAlertas.data.totalAlertas || 0);
    } catch (err) {
      console.error('Error al conectar con backend:', err);
      setDbError(err.message || 'No se pudo conectar con el servidor backend');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, cargarDatos]);

  // Sembrar datos de prueba con un solo clic si la BD está vacía
  const handleSeedDB = async (forzar = false) => {
    setSeedStatus('Inicializando catálogo en MongoDB Atlas...');
    try {
      const res = await api.post(`/seed?force=${forzar}`);
      setSeedStatus(res.data.message);
      await cargarDatos();
      setTimeout(() => setSeedStatus(''), 4000);
    } catch (err) {
      setSeedStatus(`Error: ${err.message}`);
    }
  };

  // Si no está autenticado, renderizar la pantalla de Login directamente mediante ProtectedRoute
  if (!isAuthenticated) {
    return (
      <ProtectedRoute>
        <div>Cargando...</div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="app-container">
      {/* Barra de Navegación con 5 Capas de Seguridad y Roles */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertasCount={alertasCount}
        onRefresh={cargarDatos}
      />

      {/* Banner de Estado de Conexión / Mensajes de Semillero */}
      {dbError && (
        <div style={{ background: 'var(--danger)', color: 'white', padding: '0.65rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
          <span>Error de conexión: {dbError}. Verifique que el backend esté ejecutándose en el puerto 5000.</span>
        </div>
      )}

      {seedStatus && (
        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
          <span>{seedStatus}</span>
        </div>
      )}

      {/* Si no hay productos, sugerir sembrar catálogo de demostración */}
      {!loading && productos.length === 0 && !dbError && (
        <div style={{ background: 'var(--warning-light)', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <Database size={16} color="var(--warning)" />
              <span>La base de datos en MongoDB Atlas está lista. Puede cargar medicamentos de prueba de laboratorios peruanos:</span>
            </div>
            <button className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleSeedDB(true)}>
              Cargar Catálogo Inicial de Demostración
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal según Módulo Activo */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              Conectando con MongoDB Atlas y verificando seguridad...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'pos' && (
              <POSPage
                productos={productos}
                onVentaRealizada={cargarDatos}
                onRefresh={cargarDatos}
              />
            )}

            {activeTab === 'inventario' && (
              <InventarioPage
                productos={productos}
                onRefresh={cargarDatos}
              />
            )}

            {activeTab === 'alertas' && (
              <AlertasPage
                onRefresh={cargarDatos}
              />
            )}

            {activeTab === 'ventas' && (
              <VentasHistorialPage />
            )}
          </>
        )}
      </main>

      {/* Footer Académico SENATI */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>SENATI - Trabajo Final Fullstack Developer</strong> • Botica "Nova Salud" (FarmaPlus)
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} color="var(--primary)" /> 5 Capas de Seguridad Activas
            </span>
            <span>Usuario activo: <strong>{usuario?.nombre}</strong> ({usuario?.rol})</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
