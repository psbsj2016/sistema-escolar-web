import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa'; // Importamos o plugin

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o PWA sozinho quando há nova versão
      includeAssets: ['assets/icone.png'], // Inclui os seus ícones
      manifest: {
        name: "Gestão Escolar SaaS",
        short_name: "Gestão Escolar",
        description: "Sistema completo de Gestão Escolar e Financeira",
        theme_color: "#2c3e50",
        background_color: "#f0f2f5",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "assets/icone.png", // Certifique-se de ter imagens adequadas depois
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "assets/icone.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
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
            if (setCookie) {
                // Mantém os cookies locais a funcionar perfeitamente
                proxyRes.headers['set-cookie'] = setCookie.map(s => s.replace(/Domain=[^;]+;?/, ''));
            }
          });
        },
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        matricula: resolve(__dirname, 'matricula.html')
      }
    }
  }
});