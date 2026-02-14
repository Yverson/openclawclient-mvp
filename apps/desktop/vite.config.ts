import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@screens': path.resolve(__dirname, './src/screens'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'glad-oriented-camel.ngrok-free.app'],
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  define: {
    'process.env': {},
  },
})
