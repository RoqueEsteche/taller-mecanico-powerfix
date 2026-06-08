import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from '../lib/icons';
import { loginWithPassword } from '../lib/session';
import '../styles/login.css';

function WrenchIllustration() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 opacity-90">
      {/* Gear back */}
      <circle cx="110" cy="110" r="72" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <circle cx="110" cy="110" r="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* Gear teeth */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 110 + 65 * Math.cos(angle);
        const y1 = 110 + 65 * Math.sin(angle);
        const x2 = 110 + 78 * Math.cos(angle);
        const y2 = 110 + 78 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.25)" strokeWidth="6" strokeLinecap="round" />;
      })}
      {/* Inner gear hole */}
      <circle cx="110" cy="110" r="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* Wrench */}
      <g transform="rotate(-35, 110, 110)">
        <rect x="100" y="42" width="20" height="88" rx="10" fill="rgba(255,255,255,0.85)" />
        <circle cx="110" cy="52" r="16" fill="rgba(255,255,255,0.85)" />
        <circle cx="110" cy="52" r="8" fill="rgba(230,100,20,0.9)" />
        <rect x="100" y="125" width="20" height="18" rx="4" fill="rgba(255,255,255,0.6)" />
      </g>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithPassword(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL: formulario ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f6f8] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile-only logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <span className="text-gray-800 font-black text-lg uppercase tracking-widest italic">Stihl Motors</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-1">Bienvenido!</h2>
          <p className="text-gray-500 text-sm mb-8">Inicia tu sesión para continuar al sistema</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                Correo
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@stihlmotors.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all
                             bg-white border-2 border-gray-200 text-gray-800 placeholder:text-gray-400
                             focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all
                             bg-white border-2 border-gray-200 text-gray-800 placeholder:text-gray-400
                             focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordar */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="relative w-4 h-4 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  {remember && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Recordar sesión</span>
            </label>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-2xl font-black text-[11px]
                         uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]
                         disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-gray-400 font-semibold">
            © 2026 Stihl Motors — Sistema de Gestión
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: branding ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="login__right-panel hidden lg:flex w-[480px] flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Radial glow top-right */}
        <div className="login__glow--top absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" />
        {/* Radial glow bottom-left */}
        <div className="login__glow--bottom absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" />

        {/* Orange top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-none" />

        {/* Grid pattern overlay */}
        <div className="login__grid-overlay absolute inset-0 pointer-events-none opacity-[0.04]" />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo */}
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-6">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>

          <h1 className="text-white font-black text-3xl uppercase tracking-widest italic mb-1">
            Stihl Motors
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-10">
            Acceso Interno del Personal
          </p>

          {/* Illustration */}
          <WrenchIllustration />

          <div className="mt-10 space-y-2">
            <p className="text-white font-black text-xl">¡Que gusto verte de nuevo!</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Inserta tus credenciales para<br />gestionar el taller con nosotros.
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex gap-3 mt-8 flex-wrap justify-center">
            {['Órdenes de Trabajo', 'Inventario', 'Caja', 'Reportes'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-gray-400">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <p className="absolute bottom-6 text-[11px] text-gray-600 font-semibold">
          © 2026 Creado con ♥ por el equipo Stihl
        </p>
      </motion.div>

    </div>
  );
}
