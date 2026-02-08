// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://physiotherapie-alkevanleeuwen.ch',
  integrations: [tailwind(), sitemap({
    filter: (page) => !page.includes('/studio'),
  })],
  vite: {
    server: {
      proxy: {
        '/studio': {
          target: 'http://localhost:3333',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/studio/, ''),
        },
      },
    },
  },
});