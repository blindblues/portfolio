// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://emagre.blue',
  base: '/portfolio', // Assuming the repo name is 'portfolio'
  integrations: [react()]
});