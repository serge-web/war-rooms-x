import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for Node.js globals required by StanzaJS
    global: 'window',
  },
  server: {
    proxy: {
      '/openfire-rest': {
        target: 'http://10.211.55.16:9090', 
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/openfire-rest/, '/plugins/restapi/v1'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('Sending Request:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from:', req.url, proxyRes.statusCode)
          })
        }
      }
    }
  }
})
