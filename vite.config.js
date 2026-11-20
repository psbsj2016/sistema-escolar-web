// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';

// 🚀 Carimbo único gerado a cada "npm run build"
const BUILD_VERSION = String(Date.now());

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
      includeAssets: ['assets/icone.png', 'audios/*.mp3'],

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
        skipWaiting: false,          // 🛡️ Impede o navegador de derrubar a Live no meio da aula
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
        globIgnores: [
          '**/node_modules/**/*',
          '**/uploads/**/*',
          'workspace-lousa.html',
          '**/workspace-lousa.html',
          'workspace-aulas-video.html',
          '**/workspace-aulas-video.html',
          'version.json',
          '**/version.json',
          '**/*.{mp4,webm,avi,mov,pdf,zip,rar,doc,docx,ppt,pptx,xls,xlsx}'
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        importScripts: ['/push-sw.js'],

        // 🔄 Garante que a Lousa, a Sala de Vídeos e o version.json venham SEMPRE direto do servidor (sem cache!)
        runtimeCaching: [
          {
            urlPattern: /\/version\.json/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/(workspace-lousa|workspace-aulas-video)(\.html)?(\?.*)?$/,
            handler: 'NetworkOnly'
          }
        ],

        // 🚀 O ESCUDO ANTI-SEQUESTRO (Garante que cada domínio carregue o seu próprio HTML na raiz)
        navigateFallbackDenylist: [
          /^\/$/,
          /^\/api/,
          /^\/workspace/,
          /version\.json/,
          /hub-matriculas\.html/,
          /matricula\.html/,
          /matricula-online\.html/,
          /workspace\.html/,
          /admin\.html/,
          /workspace-lousa\.html/,
          /workspace-aulas-video\.html/
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