import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

/**
 * Componente Guardián de Rutas / Vistas
 * Si el usuario no está autenticado, renderiza la vista de Login.
 * Si está autenticado, renderiza los componentes protegidos (children).
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated || !usuario) {
    return <Login />;
  }

  if (requiredRole && usuario.rol !== requiredRole) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-md">
          <h3 className="text-lg font-bold text-amber-900 mb-2">
            Permisos Insuficientes
          </h3>
          <p className="text-sm text-amber-700">
            Esta sección requiere privilegios de <strong>{requiredRole}</strong>. Su rol actual es <strong>{usuario.rol}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
