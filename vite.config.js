import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative assets work both at /XLock/ on GitHub Pages and at / on Vercel.
  base: './',
})
