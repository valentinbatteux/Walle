import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
  // Local dev/prod: base '/'
  // GitHub Pages: set env VITE_BASE_PATH=/Walle/
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
  },
});
