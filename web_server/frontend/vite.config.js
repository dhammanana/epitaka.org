import { defineConfig } from 'vite'
import { resolve }      from 'path'

export default defineConfig({
  root: resolve(__dirname, 'src'),
  build: {
    outDir:    resolve(__dirname, '../static/js'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        book: resolve(__dirname, 'src/book.js'),
      },
      output: {
        entryFileNames: '[name].bundle.js',
        chunkFileNames: '[name].chunk.js',
        // CSS extracted alongside the JS bundle
        assetFileNames: assetInfo =>
          assetInfo.name?.endsWith('.css')
            ? '../css/[name][extname]'   // → static/css/book.css (or book.bundle.css)
            : '[name][extname]',
      },
    },
  },
})
