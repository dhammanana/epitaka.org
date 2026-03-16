import { defineConfig } from 'vite'
import { resolve }      from 'path'

export default defineConfig({
  root: resolve(__dirname, 'src'),
  build: {
    outDir:      resolve(__dirname, '../static'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        book:  resolve(__dirname, 'src/book.js'),
        index: resolve(__dirname, 'src/index.js'),
      },
      output: {
        entryFileNames: 'js/[name].bundle.js',
        chunkFileNames: 'js/[name].chunk.js',
        assetFileNames: assetInfo =>
          assetInfo.name?.endsWith('.css')
            ? 'css/[name][extname]'
            : 'js/assets/[name][extname]',
      },
    },
  },
})