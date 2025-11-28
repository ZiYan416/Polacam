import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Change 'polacam' to your actual GitHub repository name
  // Example: If your repo is at https://github.com/john/my-camera, change this to '/my-camera/'
  base: process.env.NODE_ENV === 'production' ? '/Polacam/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});