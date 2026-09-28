import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const productionSecurityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' http://localhost:5000 http://localhost:5001 ws://localhost:5173 https://sliit-af-backend.onrender.com https://nominatim.openstreetmap.org; font-src 'self' https://fonts.gstatic.com data:; form-action 'self' https://checkout.stripe.com; frame-ancestors 'none'; frame-src https://www.google.com; img-src 'self' data: blob: https:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

const developmentSecurityHeaders = {
  ...productionSecurityHeaders,
  'Content-Security-Policy': productionSecurityHeaders['Content-Security-Policy'].replace(
    "connect-src 'self'",
    "connect-src 'self' ws://localhost:*"
  ).replace(
    "script-src 'self'",
    "script-src 'self' 'unsafe-inline'"
  ),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // open in your default system browser (Chrome, Edge, etc.)
    headers: developmentSecurityHeaders,
  },
  preview: {
    headers: productionSecurityHeaders,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})