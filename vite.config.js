import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// WAYNE OS // The Dark Knight Protocol
// base: './' → relative asset paths, so it works on GitHub Pages project
// sites (https://<user>.github.io/<repo>/) regardless of the repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 6626, open: true },
})
