import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: 'frontend',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL ?? ''),
    },
    resolve: {
      alias: [
        {
          find: /^es-toolkit\/compat\/(.*)$/,
          replacement: path.resolve(__dirname, 'node_modules/es-toolkit/compat/$1.js'),
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, 'frontend'),
        },
        {
          find: 'framer-motion',
          replacement: path.resolve(__dirname, 'frontend/src/lib/motion.tsx'),
        },
        {
          find: 'motion/react',
          replacement: path.resolve(__dirname, 'frontend/src/lib/motion.tsx'),
        },
      ],
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-charts': ['recharts'],
            'vendor-pdf':    ['jspdf', 'jspdf-autotable'],
            'vendor-xlsx':   ['xlsx'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
