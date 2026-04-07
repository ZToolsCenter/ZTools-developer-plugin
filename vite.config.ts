import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import {join} from "path";


// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    port: 8686,
    host: '0.0.0.0',
    open: false,
  },
  build: {
    sourcemap: false,
    emptyOutDir: true,
    outDir: join(__dirname, '/src-ztools/dist'),
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    UnoCSS(),
    codeInspectorPlugin({
      bundler: 'vite',
      editor: 'webstorm',
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
