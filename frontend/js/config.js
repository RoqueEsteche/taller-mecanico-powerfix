/**
 * config.js — PowerFix
 * URL del backend: localhost en desarrollo, mismo origen en producción
 * (en Render el frontend es servido por el propio FastAPI).
 */
const _isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

window.PF_CONFIG = {
  API_URL: _isLocal ? 'http://localhost:8000' : window.location.origin,
};
