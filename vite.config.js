import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add Node.js polyfills for browser compatibility
      'buffer': 'buffer',
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  define: {
    // Define global variables for Node.js compatibility
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer']
  }
});