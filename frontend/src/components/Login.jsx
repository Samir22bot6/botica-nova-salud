import React, { useState } from 'react';
import { 
  Activity, 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, demoLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingrese correo y contraseña.');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.message || 'Credenciales incorrectas.');
    }
  };

  const handleDemoAccess = async (rol) => {
    setError('');
    const res = await demoLogin(rol);
    if (!res.success) {
      setError(res.message || `No se pudo iniciar sesión como ${rol}.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative overflow-hidden">
        {/* Decoración Superior */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />

        {/* Encabezado e Isotipo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-3">
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Botica Nova Salud
          </h2>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
            FarmaPlus • Sistema POS & Inventario
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Ingrese sus credenciales autorizadas para acceder a la plataforma.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Correo Electrónico
            </label>
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 focus-within:border-emerald-600 rounded-xl px-3 py-2.5 transition-all">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email"
                placeholder="ejemplo@novasalud.com"
                className="w-full bg-transparent border-none outline-none text-xs text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Contraseña
            </label>
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 focus-within:border-emerald-600 rounded-xl px-3 py-2.5 transition-all">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-none text-xs text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Validando...' : 'Iniciar Sesión'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Accesos de Demostración SENATI
          </span>
        </div>

        {/* Botones de Acceso Rápido para Pruebas del Jurado */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleDemoAccess('Admin')}
            disabled={loading}
            className="py-2.5 px-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 group-hover:text-emerald-700">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Rol: Administrador</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Control Total & Lotes</div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoAccess('Cajero')}
            disabled={loading}
            className="py-2.5 px-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 group-hover:text-sky-700">
              <UserCheck size={14} className="text-sky-600" />
              <span>Rol: Cajero POS</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ventas y Facturación</div>
          </button>
        </div>

        {/* Pie Académico */}
        <div className="mt-6 text-center text-[11px] text-slate-400 font-medium">
          Trabajo Final Fullstack Developer • SENATI 2026
        </div>
      </div>
    </div>
  );
};

export default Login;
