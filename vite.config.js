// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

// 🚀 Carimbo único gerado a cada "npm run build"
const BUILD_VERSION = String(Date.now());

// ⚙️ PARÂMETRO AJUSTÁVEL: tempo máximo (segundos) aguardando rede antes de tentar cache em scripts
const TIMEOUT_REDE_SEGUNDOS = 5;

// Plugin que grava automaticamente o ficheiro dist/version.json em cada compilação
function geradorVersaoBuild() {
  return {
    name: 'gerador-versao-build',
    writeBundle() {
      try {
        const versionData = JSON.stringify({
          version: BUILD_VERSION,
          builtAt: new Date().toISOString()
        });
        fs.writeFileSync(resolve(__dirname, 'dist', 'version.json'), versionData, 'utf-8');
        console.log(`✅ [Versão Global] dist/version.json gerado com sucesso: ${BUILD_VERSION}`);
      } catch (e) {
        console.error('Erro ao gerar version.json:', e);
      }
    }
  };
}

// 🏷️ Injeta a versão exata da compilação em TODOS os HTMLs (inclusive Lousa e Sala de Vídeos)
function injetarVersaoNosHtmls() {
  return {
    name: 'injetar-versao-nos-htmls',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const metaTag = `<meta name="app-build-version" content="${BUILD_VERSION}">`;
        if (html.includes('name="app-build-version"')) return html;
        return html.replace('</head>', `  ${metaTag}\n</head>`);
      }
    }
  };
}

// 🛡️ Impede que o VitePWA injete o manifesto do Gestão Escolar dentro do workspace.html
function preservarManifestoWorkspace() {
  return {
    name: 'preservar-manifesto-workspace',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (ctx && ctx.filename && ctx.filename.includes('workspace.html')) {
          return html.replace(/<link\s+rel=["']manifest["']\s+href=["'][^"']*manifest\.webmanifest["'][^>]*>/gi, '');
        }
        return html;
      }
    }
  };
}

export default defineConfig({
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(BUILD_VERSION)
  },
  plugins: [
    injetarVersaoNosHtmls(),
    geradorVersaoBuild(),
    VitePWA({
      registerType: 'prompt',
      // 🪶 Mantém apenas o ícone leve no precache (evita carregar centenas de MB no Service Worker)
      includeAssets: ['assets/icone.png'],

      manifest: {
        id: "/",
        name: "Gestão Escolar SaaS",
        short_name: "Gestão Escolar",
        description: "Sistema completo de Gestão Escolar e Financeira",
        theme_color: "#2c3e50",
        background_color: "#f0f2f5",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        icons: [
          { src: "assets/icone.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "assets/icone.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true, // 🧹 Apaga caches antigos automaticamente
        skipWaiting: false,          // 🛡️ Protege Aulas Ao Vivo (o pwa-updater.js libera fora da Live)
        clientsClaim: true,
        navigateFallback: null,      // 🚀 Deixa as rotas HTML 100% com a Vercel (nunca serve HTML velho do cache)

        // 🪶 CORREÇÃO CRÍTICA: Em vez de precachear 1.770 arquivos (671 MB), precacheia só o manifesto!
        globPatterns: ['manifest.webmanifest'],
        importScripts: ['/push-sw.js'],

        // 🔄 Garante que HTMLs, Lousa, Sala de Vídeos e version.json venham SEMPRE direto da rede
        runtimeCaching: [
          {
            urlPattern: /\/version\.json/,
            handler: 'NetworkOnly'
          },
        {
            urlPattern: /\/(index|hub-matriculas|matricula|matricula-online|workspace|workspace-lousa|workspace-aulas-video|admin)(\.html)?(\?.*)?$/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/assets\/.*\.(js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'workspace-bundles-v2',
              networkTimeoutSeconds: TIMEOUT_REDE_SEGUNDOS
            }
          }
        ]
      }
    }),
    preservarManifestoWorkspace()
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
    outDir: 'dist',
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        matricula: resolve(__dirname, 'matricula.html'),
        hub: resolve(__dirname, 'hub-matriculas.html'),
        online: resolve(__dirname, 'matricula-online.html'),
        workspace: resolve(__dirname, 'workspace.html'),
        lousa: resolve(__dirname, 'workspace-lousa.html'),
        videoAulas: resolve(__dirname, 'workspace-aulas-video.html')
      }
    }
  }
});