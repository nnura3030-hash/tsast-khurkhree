import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rolldownOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/jspdf')) return 'admin-tools';
        },
      },
    },
    // Warn at 600KB instead of 500KB
    chunkSizeWarningLimit: 600,
  },

  // Dev server
  server: {
    port: 5174,
    strictPort: false,
    open: false,
  },

  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'recharts'],
    exclude: ['jspdf', 'jspdf-autotable', 'xlsx'],
  },
})
