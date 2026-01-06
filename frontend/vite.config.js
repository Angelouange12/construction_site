import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  // Charge les variables d'environnement en fonction du mode (dev/prod)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Configuration de base
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor';
              }
              if (id.includes('recharts')) {
                return 'charts';
              }
              if (id.includes('react-big-calendar') || id.includes('moment') || id.includes('date-fns')) {
                return 'calendar';
              }
              return 'vendor-other';
            }
          },
        },
      },
    },
    define: {
      'process.env': {}
    },
  };

  // Configuration spécifique à la production
  if (mode === 'production') {
    config.base = '/'; // Ou votre chemin de base si nécessaire
    config.preview = {
      port: 3000,
      strictPort: true,
    };
  }

  return config;
});
