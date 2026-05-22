import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://putaoso.com',
  build: {
    format: 'file', // 输出 about.html 而不是 about/index.html
  },
  integrations: [sitemap()],
});
