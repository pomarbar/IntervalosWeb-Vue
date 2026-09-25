import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Cuando Vite vea una petición que empiece por /api...
      '/api': {
        // ...la reenvía al servidor PHP que vamos a encender en el puerto 8000
        target: 'http://localhost:8000', 
        changeOrigin: true,
      }
    }
  }
})