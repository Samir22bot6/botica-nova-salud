import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const cached = localStorage.getItem('nova_salud_user');
    return cached
      ? JSON.parse(cached)
      : {
          id: 'demo-cajero',
          nombre: 'Juan Pérez (Cajero)',
          email: 'caja@novasalud.com',
          rol: 'Cajero',
        };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('nova_salud_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          if (res.data?.usuario) {
            setUsuario(res.data.usuario);
            localStorage.setItem('nova_salud_user', JSON.stringify(res.data.usuario));
          }
        })
        .catch(() => {
          // Token expirado o servidor reiniciado
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, usuario: userLogueado } = res.data;
      localStorage.setItem('nova_salud_token', token);
      localStorage.setItem('nova_salud_user', JSON.stringify(userLogueado));
      setUsuario(userLogueado);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nova_salud_token');
    localStorage.removeItem('nova_salud_user');
    setUsuario({
      id: 'demo-cajero',
      nombre: 'Juan Pérez (Cajero)',
      email: 'caja@novasalud.com',
      rol: 'Cajero',
    });
  };

  // Alternador rápido de rol para evaluación académica de SENATI
  const switchRole = (nuevoRol) => {
    const rolesMap = {
      Admin: {
        id: 'demo-admin',
        nombre: 'Lic. Carlos Mendoza (Admin)',
        email: 'admin@novasalud.com',
        rol: 'Admin',
      },
      Farmacéutico: {
        id: 'demo-farma',
        nombre: 'Q.F. Elena Ramos (Farmacéutica)',
        email: 'farmacia@novasalud.com',
        rol: 'Farmacéutico',
      },
      Cajero: {
        id: 'demo-cajero',
        nombre: 'Juan Pérez (Cajero)',
        email: 'caja@novasalud.com',
        rol: 'Cajero',
      },
    };

    const targetUser = rolesMap[nuevoRol] || rolesMap['Cajero'];
    setUsuario(targetUser);
    localStorage.setItem('nova_salud_user', JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

