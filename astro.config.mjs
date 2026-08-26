// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `astro build` corre en modo production tanto en producción como en los previews
// de Vercel, así que import.meta.env.PROD no distingue entre ambos. VERCEL_ENV sí.
const isProduction = process.env.VERCEL_ENV === 'production';

export default defineConfig({
  site: 'https://ecotranslate.app',
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    define: {
      // Disponible dentro de los <script> de cliente, donde import.meta.env no se
      // sustituye. Es lo que decide si la analítica envía o solo loguea.
      __ANALYTICS_ENABLED__: JSON.stringify(isProduction),
    },
  },
});
