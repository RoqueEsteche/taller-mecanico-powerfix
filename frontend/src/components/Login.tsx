import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from '../lib/icons';
import { loginWithPassword } from '../lib/session';
import '../styles/login.css';

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
    <div className="login-page">

      {/* ── PANEL IZQUIERDO: formulario ─────────────────────── */}
      <motion.div
        className="login-page__left"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo solo visible en mobile */}
        <div className="login-page__mobile-logo">
          <div className="login-page__logo-icon">
            <svg viewBox="0 0 24 24" className="login-page__logo-svg" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span className="login-page__mobile-brand">Stihl Motors</span>
        </div>

        {/* Card del formulario */}
        <div className="login-page__card">
          <div className="login-page__card-header">
            <h2 className="login-page__title">Bienvenido!</h2>
            <p className="login-page__subtitle">Inicia tu sesión para continuar al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="login-page__form">

            {/* Email */}
            <div className="login-page__field">
              <label className="login-page__label">Correo</label>
              <div className="login-page__input-wrap">
                <svg className="login-page__input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@stihlmotors.com"
                  required
                  autoComplete="email"
                  className="login-page__input"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="login-page__field">
              <label className="login-page__label">Contraseña</label>
              <div className="login-page__input-wrap">
                <svg className="login-page__input-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="login-page__input login-page__input--password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                  className="login-page__eye-btn"
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff className="login-page__eye-icon" /> : <Eye className="login-page__eye-icon" />}
                </button>
              </div>
            </div>

            {/* Recordar sesión */}
            <label className="login-page__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="login-page__checkbox"
              />
              <span className="login-page__remember-label">Recordar sesión</span>
            </label>

            {/* Error */}
            {error && (
              <div className="login-page__error" role="alert">
                <svg className="login-page__error-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-page__submit"
            >
              {loading ? (
                <>
                  <span className="login-page__spinner" />
                  Verificando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>

          </form>

          <p className="login-page__footer-note">
            © 2026 Stihl Motors — Sistema de Gestión
          </p>
        </div>
      </motion.div>

      {/* ── PANEL DERECHO: branding ────────────────────────── */}
      <motion.div
        className="login-page__right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="login-page__right-glow login-page__right-glow--top" />
        <div className="login-page__right-glow login-page__right-glow--bottom" />
        <div className="login-page__right-grid" />
        <div className="login-page__right-accent" />

        <div className="login-page__brand">
          <div className="login-page__brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="login-page__brand-svg">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>

          <h1 className="login-page__brand-name">Stihl Motors</h1>
          <p className="login-page__brand-sub">Acceso Interno del Personal</p>

          {/* Ilustración */}
          <div className="login-page__illustration">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={100 + 60 * Math.cos(a)} y1={100 + 60 * Math.sin(a)}
                    x2={100 + 72 * Math.cos(a)} y2={100 + 72 * Math.sin(a)}
                    stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"
                  />
                );
              })}
              <circle cx="100" cy="100" r="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
              <g transform="rotate(-35, 100, 100)">
                <rect x="91" y="38" width="18" height="80" rx="9" fill="rgba(255,255,255,0.8)" />
                <circle cx="100" cy="48" r="14" fill="rgba(255,255,255,0.8)" />
                <circle cx="100" cy="48" r="7" fill="rgba(231,84,12,0.9)" />
              </g>
            </svg>
          </div>

          <p className="login-page__brand-headline">¡Que gusto verte de nuevo!</p>
          <p className="login-page__brand-desc">
            Inserta tus credenciales para<br />gestionar el taller con nosotros.
          </p>

          <div className="login-page__badges">
            {['Órdenes de Trabajo', 'Inventario', 'Caja', 'Reportes'].map(f => (
              <span key={f} className="login-page__badge">{f}</span>
            ))}
          </div>
        </div>

        <p className="login-page__right-footer">© 2026 Creado con ♥ por el equipo Stihl</p>
      </motion.div>

    </div>
  );
}
