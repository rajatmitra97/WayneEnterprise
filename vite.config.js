import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base: the same build works on GitHub Pages under any repository
  // name (rajatmitra97.github.io/WayneEnterprise/), in `vite preview`, and when
  // opened from a local folder. The app has no client-side routes, so './' is safe.
  base: './',
})
