/**
 * netlify/functions/api.js
 *
 * Envuelve la Express app en una Netlify Function serverless.
 * serverless-http traduce el evento de Netlify al formato req/res de Node.js.
 *
 * Flujo de una petición:
 *   Browser → /api/contact
 *   ↓  (netlify.toml redirect: /api/* → /.netlify/functions/api)
 *   event.path = '/api/contact'  ← Netlify preserva el path original
 *   ↓  (serverless-http)
 *   Express → POST /api/contact → PostgreSQL → res.json(201)
 */

import serverless from 'serverless-http';
import { app, ensureCatalogTables } from '../../backend/server/index.js';

// Se inicializa una sola vez por instancia (warm Lambda/container)
let serverlessHandler = null;
let tablesReady = false;

async function getHandler() {
  if (!tablesReady) {
    try {
      await ensureCatalogTables();
    } catch (err) {
      // Las tablas pueden ya existir — no abortar
      console.error('[netlify/api] ensureCatalogTables:', err.message);
    }
    tablesReady = true;
    serverlessHandler = serverless(app);
  }
  return serverlessHandler;
}

export const handler = async (event, context) => {
  const fn = await getHandler();
  return fn(event, context);
};
