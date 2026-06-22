// vite.workspace.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/workspace/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate', // 🚀 Alterado para atualizar automaticamente
      injectRegister: 'script',   // 🚀 CRÍTICO: Força a injeção do motor PWA no workspace.html
      includeAssets: ['assets/icone.png'],
      scope: '/workspace/',
      manifest: {
        id: "/workspace-pwa-app-id",
        name: "Portal Workspace Escolar",
        short_name: "WS Escola",
        description: "Módulo de Workspace, Comunicação e Mural Escolar",
        theme_color: "#2c3e50",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/workspace/workspace.html",
        icons: [
          { src: "assets/icone.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "assets/icone.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/matricula/, /^\/admin/, /^\/hub-matriculas/]
      }
    })
  ],
  
  server: {
    proxy: {
      '/api': {
        target: 'https://api.sistemaptt.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) proxyRes.headers['set-cookie'] = setCookie.map(s => s.replace(/Domain=[^;]+;?/, ''));
          });
        }
      }
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist/workspace'),
    emptyOutDir: false, // 🛡️ CORREÇÃO: Impede que o Vite apague o site principal na Vercel!
    rollupOptions: {
      input: {
        workspace: resolve(__dirname, 'workspace.html')
      }
    }
  }
});