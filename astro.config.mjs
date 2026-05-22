import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://putaoso.com',
  build: {
    format: 'file', // 输出 about.html 而不是 about/index.html
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh-CN',
          en: 'en',
          de: 'de',
          es: 'es',
        },
      },
    }),
  ],
});
