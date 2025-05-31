import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/pwa-calculator-test/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fisc36',
        short_name: 'Fisc36',
        start_url: '.',
        display: 'standalone',
        background_color: '#fff',
        theme_color: '#047878',
        icons: [
          {
            "src": "/icon-android-192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/icon-android-512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            src: '/icon-ios.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});