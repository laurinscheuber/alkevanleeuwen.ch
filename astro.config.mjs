// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: 'https://physiotherapie-alkevanleeuwen.ch',
  trailingSlash: 'ignore',

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
          rewrite: (path) => path === '/studio' || path === '/studio/' ? '/' : path,
        },
      },
    },
  },

  adapter: node({
    mode: 'standalone'
  }),
});