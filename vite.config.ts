import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    build({
      outputDir: 'dist',
      emptyOutDir: true,
      minify: true,
      external: [],
      entry: 'src/index.tsx'
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // Cloudflare Pages static assets
        assetFileNames: '[name].[ext]'
      }
    }
  }
}))
