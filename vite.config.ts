import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from a GitHub Pages project subpath, not the domain root.
  base: '/circle-skirt-calculator/',
  plugins: [react(), tailwindcss()],
})
