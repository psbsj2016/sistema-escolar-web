import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Garante que todos os assets (JS/CSS) desta app sejam carregados da subpasta correta
  base: '/workspace/',
  
  plugins: [
    VitePWA({
      registerType: 'prompt', 
      includeAssets: ['assets/icone.png'],
      
      // O Service Worker fica restrito a este território
      scope: '/workspace/',
      
      manifest: {
        id: "/workspace-pwa-app-id",
        name: "Portal Workspace Escolar",
        short_name: "WS Escola",
        description: "Módulo de Workspace, Comunicação e Mural Escolar",
        theme_color: "#2c3e50",
        background_color: "#ffffff",
        display: "standalone",
        
        // 🚀 CRÍTICO: Como o ficheiro se chama workspace.html, a PWA tem de arrancar por ele!
        start_url: "/workspace/workspace.html",
        
        icons: [
          { src: "assets/icone.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "assets/icone.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        // Bloqueia as rotas do sistema principal
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
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 🚀 CRÍTICO: Chave e caminho corretos para o ficheiro na raiz!
        workspace: resolve(__dirname, 'workspace.html')
      }
    }
  }
});