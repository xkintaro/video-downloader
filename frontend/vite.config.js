import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_FRONTEND_PORT),
      proxy: {
        '/download': {
          target: env.VITE_FRONTEND_API_URL || 'http://localhost:5000',
          changeOrigin: true
        },
        '/downloads': {
          target: env.VITE_FRONTEND_API_URL || 'http://localhost:5000',
          changeOrigin: true
        }
      }

    },
    define: {
      'import.meta.env.VITE_FRONTEND_API_URL': JSON.stringify(env.VITE_FRONTEND_API_URL),
    }
  };
})