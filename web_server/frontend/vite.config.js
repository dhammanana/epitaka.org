import { defineConfig } from 'vite'
import { resolve }      from 'path'

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
        // Keep the shared consent chunk name stable, while adding a hash to
        // all entry bundles so an old entry can never pair with a new chunk.
        entryFileNames: 'js/[name].bundle.js',
        chunkFileNames: 'js/[name]-[hash].chunk.js',
        assetFileNames: assetInfo =>
          assetInfo.name?.endsWith('.css')
            ? 'css/[name][extname]'
            : 'js/assets/[name][extname]',
      },
    },
  },
})