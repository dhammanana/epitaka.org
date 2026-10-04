import { defineConfig } from 'vite'
import { resolve }      from 'path'

// Adblock filter lists (EasyList Cookie, Fanboy Annoyances, AdGuard
// Annoyances, uBlock) block any request whose URL contains words like
// "cookie-consent", "consent" or "analytics". A blocked shared chunk kills
// every entry that statically imports it — on epitaka.org this once took
// down the whole book reader (mobile hamburger / sidebar dead) for visitors
// with an adblocker. Map such names to a neutral filename so built URLs
// never match a filter rule.
const BLOCKED_CHUNK_RE = /cookie|consent|analytic|track|advert|beacon|gtag|pixel/i;

function safeChunkFileName(chunkInfo) {
  const raw = chunkInfo.name || 'shared';
  const safe = BLOCKED_CHUNK_RE.test(raw) ? 'shared' : raw;
  return `js/${safe}-[hash].chunk.js`;
}

export default defineConfig({
  base: '/static/',
  root: resolve(__dirname, 'src'),

  build: {
    // Output to frontend/dist/ — clean separation from Flask's static folder.
    // Flask serves this via static_folder in app/__init__.py.
    outDir:      resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        book:   resolve(__dirname, 'src/book.js'),
        index:  resolve(__dirname, 'src/index.js'),
        about:  resolve(__dirname, 'src/about.js'),
        editor: resolve(__dirname, 'src/editor.js'),
      },
      output: {
        // Entry bundles are cached via the ?v= query param (asset version
        // derived from bundle mtimes). Chunk URLs carry a content hash so an
        // old entry can never pair with a new chunk. Chunk basenames are
        // sanitised (see safeChunkFileName) so adblock lists never match.
        entryFileNames: 'js/[name].bundle.js',
        chunkFileNames: safeChunkFileName,
        assetFileNames: assetInfo =>
          assetInfo.name?.endsWith('.css')
            ? 'css/[name][extname]'
            : 'js/assets/[name][extname]',
      },
    },
  },
})