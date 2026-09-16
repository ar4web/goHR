import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { renderShell, parseShellAttrs } from './src/components/shell-render.js';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Auto-detect every entry HTML in src/pages/ and register it as a Rollup input.
function discoverEntries() {
  const dir = resolve(import.meta.dirname, 'src/pages');
  const out = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.html')) continue;
    const stem = file === 'index.html' ? 'main' : file.replace(/\.html$/, '');
    out[stem] = `src/pages/${file}`;
  }
  return out;
}

// Inject sidebar/topbar into pages with body[data-shell="admin"] at
// dev/build time so the shell paints on the first frame (no FOUC).
function shellInjectionPlugin() {
  let base = '/';
  return {
    name: 'gohr-shell-injection',
    configResolved(config) { base = config.base || '/'; },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let out = html;

        // PWA + meta tags for every page.
        const metaPwa = `<link rel="stylesheet" href="${base}src/styles/main.scss">
<link rel="manifest" href="${base}site.webmanifest">
<meta name="theme-color" content="#1ABB9C" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="view-transition" content="same-origin">
<link rel="apple-touch-icon" href="${base}images/apple-touch-icon.svg">`;
        out = out.replace(/<\/head>/i, `${metaPwa}\n</head>`);

        // SEO meta — skip if page already declares a description.
        if (!/name=["']description["']/i.test(out)) {
          const titleMatch = /<title>([^<]+)<\/title>/i.exec(out);
          const title = titleMatch ? titleMatch[1].replace(/\s+\|\s+.*$/, '').trim() : 'goHR';
          const bcMatch = /data-breadcrumb=["']([^"']+)["']/i.exec(out);
          const breadcrumb = bcMatch
            ? bcMatch[1].replace(/\|[^>]*/g, '').replace(/^Home\s*>\s*/, '').replace(/\s*>\s*/g, ' > ').trim()
            : '';
          const desc = breadcrumb ? `${title} — ${breadcrumb}.` : 'goHR — HR command center.';
          const seo = `<meta name="description" content="${desc.replace(/"/g, '&quot;')}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
<meta property="og:image" content="${base}images/android-chrome-512x512.svg">
<meta property="og:site_name" content="goHR">
<meta name="twitter:card" content="summary_large_image">`;
          out = out.replace(/<\/head>/i, `${seo}\n</head>`);
        }

        // Pre-paint script: sets theme/lang/dir before body renders to
        // avoid a flash. The saved theme (light | dark) is read synchronously
        // from localStorage; keep the backgrounds in sync with --body-bg in
        // _tokens.scss and PRE_PAINT_BG in src/components/theme.js.
        const prePaint = `<script>(function(){try{var t='light';try{if(localStorage.getItem('hr:theme')==='dark'){t='dark';}}catch(e){}document.documentElement.setAttribute('data-theme',t);document.documentElement.style.background=(t==='dark'?'#121417':'#f5f7fb');document.documentElement.setAttribute('lang','en');document.documentElement.setAttribute('dir','ltr');}catch(e){}})();</script>`;
        out = out.replace(/<\/head>/i, `${prePaint}\n</head>`);

        // Admin-shell injection for pages with body[data-shell="admin"].
        const bodyTag = /<body\b((?:"[^"]*"|'[^']*'|[^>"'])*) *>/i.exec(out);
        if (!bodyTag) return out;
        const parsed = parseShellAttrs(bodyTag[1]);
        if (!parsed) return out;

        const { sidebar, topbar } = renderShell(parsed);
        const skipLink = `<a class="skip-link" href="#main-content">Skip to main content</a>`;

        out = out.replace(
          /<main\s+class=["']main["']/i,
          `${skipLink}\n${sidebar}\n${topbar}\n<main id="main-content" tabindex="-1" class="main"`
        );
        return out;
      }
    }
  };
}

// Dev server root redirect to dashboard.
function rootRedirectPlugin() {
  return {
    name: 'gohr-root-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          res.writeHead(302, { location: '/src/pages/index.html' });
          res.end();
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: [
          '<!DOCTYPE html>',
          '<meta http-equiv="refresh" content="0;url=src/pages/index.html">',
          '<link rel="canonical" href="src/pages/index.html">',
          '<title>goHR</title>',
          ''
        ].join('\n')
      });
    }
  };
}

export default defineConfig(({ command }) => ({
  root: '.',
  base: command === 'serve' ? '/' : (process.env.BASE_PATH ?? '/'),
  publicDir: 'public',
  plugins: [shellInjectionPlugin(), rootRedirectPlugin()],
  logLevel: 'info',
  clearScreen: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    cssMinify: true,
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
    target: 'es2022',
    rollupOptions: {
      treeshake: true,
      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap'
        })
      ],
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/echarts\//.test(id)) return 'vendor-echarts';
          if (/node_modules\/datatables\.net\//.test(id)) return 'vendor-tables';
          if (/node_modules\/leaflet\//.test(id)) return 'vendor-maps';
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? assetInfo.names?.[0] ?? '';
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) return `images/[name]-[hash][extname]`;
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return `fonts/[name]-[hash][extname]`;
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      },
      input: discoverEntries()
    },
    minify: 'esbuild'
  },
  esbuild: {
    target: 'es2022',
    drop: ['console', 'debugger']
  },
  server: {
    open: '/src/pages/index.html',
    port: Number(process.env.PORT) || 9173,
    host: true,
    allowedHosts: ['.e2b.app'],
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:8080',
        changeOrigin: true
      }
    },
    watch: {
      usePolling: false,
      interval: 100,
      ignored: ['**/node_modules/**', '**/dist/**']
    },
    hmr: { overlay: false }
  },
  preview: {
    open: '/src/pages/index.html',
    port: Number(process.env.PREVIEW_PORT) || 9174,
    host: true,
    allowedHosts: ['.e2b.app']
  },
  optimizeDeps: {
    include: ['echarts', 'datatables.net', 'leaflet'],
    force: false
  },
  css: {
    devSourcemap: process.env.NODE_ENV !== 'production',
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
        includePaths: ['node_modules'],
        sourceMap: process.env.NODE_ENV !== 'production',
        sourceMapContents: process.env.NODE_ENV !== 'production'
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"'
  }
}));
