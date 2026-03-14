import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://vc.adsbyjer.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
