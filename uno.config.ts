import {defineConfig, presetAttributify, presetTypography, presetWind3} from 'unocss'
import presetIcons from '@unocss/preset-icons'
import {FileSystemIconLoader} from '@iconify/utils/lib/loader/node-loaders.js'
import {fileURLToPath, URL} from 'node:url'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  content: {
    filesystem: ['src/**/*.{vue,js,ts}'],
  },
  safelist: [
    'i-u-development',
    'i-u-history',
    'i-u-feedback',
    'i-u-services',
    'i-u-team',
  ],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      collections: {
        u: FileSystemIconLoader(
          fileURLToPath(new URL('./src/assets/icons', import.meta.url)),
          (svg) => {
            return svg
              .replace(/(<svg.*?fill=)"(?!none)(.*?)"/, '$1"currentColor"')
              .replace(/(<svg.*?stroke=)"(?!none)(.*?)"/, '$1"currentColor"');
          }
        ),
        z: FileSystemIconLoader(
          fileURLToPath(new URL('./src/assets/icons', import.meta.url)),
          (svg) => {
            return svg
              .replace(/(<svg.*?fill=)"(?!none)(.*?)"/, '$1"currentColor"')
              .replace(/(<svg.*?stroke=)"(?!none)(.*?)"/, '$1"currentColor"');
          }
        )
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives()],
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      ut: '800px',
      mobile: '360px',
    },
  },
  shortcuts: {
    'u-cc': 'flex flex-center items-center',
    'u-hover': 'duration-300 hover:text-[var(--u-text-color-hover)]',
  },
})
