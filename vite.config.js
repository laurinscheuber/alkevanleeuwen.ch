import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        expertise: resolve(__dirname, 'expertise.html'),
        angebot: resolve(__dirname, 'angebot.html'),
        galerie: resolve(__dirname, 'galerie.html'),
        kontakt: resolve(__dirname, 'kontakt.html'),
        impressum: resolve(__dirname, 'impressum.html'),
        // aktuelles: resolve(__dirname, 'aktuelles.html'), // Uncomment if needed later
      },
    },
  },
});
