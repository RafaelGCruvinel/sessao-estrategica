import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://sessaoestrategica.com.br';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    preact({ compat: false }),
    sitemap({
      filter: (page) => !page.includes('/nao-elegivel') && !page.includes('/obrigado'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: false,
  },
});
