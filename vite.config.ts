import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  // Define environment variables for production
  define: {
    // These will be replaced with actual values during build
    __API_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3002'),
    __EMAIL_API_URL__: JSON.stringify(process.env.VITE_EMAIL_API_BASE_URL || 'http://localhost:3003'),
  },
});
