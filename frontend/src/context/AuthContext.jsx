import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const cachedUser = localStorage.getItem('nova_salud_user');
    const token = localStorage.getItem('nova_salud_token');
    if (cachedUser && token) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Al montar, valida si el token guardado sigue siendo válido
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
          logout();
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
    setUsuario(null);
  };

  // Función para ingresar rápido con credenciales de prueba durante la evaluación
  const demoLogin = async (rol = 'Admin') => {
    if (rol === 'Admin') {
      return await login('admin@novasalud.com', 'admin123');
    } else {
      return await login('caja@novasalud.com', 'caja123');
    }
  };

  const isAuthenticated = Boolean(usuario && localStorage.getItem('nova_salud_token'));
  const isAdmin = usuario?.rol === 'Admin';
  const isCajero = usuario?.rol === 'Cajero';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        login,
        logout,
        demoLogin,
        isAuthenticated,
        isAdmin,
        isCajero,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
