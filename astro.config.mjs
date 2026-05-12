import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://putaoso.com',
  build: {
    format: 'file', // 输出 about.html 而不是 about/index.html
  },
});
