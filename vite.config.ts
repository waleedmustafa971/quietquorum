import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    manifest: {
      name: 'QuietQuorum', short_name: 'QuietQuorum',
      description: 'Every voice has a place in the findings.',
      theme_color: '#294b43', background_color: '#f7f7f2', display: 'standalone',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'], maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 }
  })]
});
