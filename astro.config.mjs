// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `astro build` corre en modo production tanto en producción como en los previews
// de Vercel, así que import.meta.env.PROD no distingue entre ambos. VERCEL_ENV sí.
const isProduction = process.env.VERCEL_ENV === 'production';

const SITE = 'https://ecotranslate.app';

/**
 * Prioridad por tipo de página. El hub de herramientas va por encima de las
 * herramientas sueltas porque es la puerta de entrada de todo el cluster.
 */
function priorityFor(pathname) {
  if (pathname === '/' || pathname === '/en/') return 1.0;
  if (pathname === '/tools/' || pathname === '/en/tools/') return 0.8;
  if (pathname.startsWith('/tools/') || pathname.startsWith('/en/tools/')) return 0.7;
  if (pathname.includes('checkout')) return 0.3;
  return 0.5;
}

/**
 * El sitemap emite las rutas con barra final y los <link rel="canonical"> del
 * sitio no la llevan. Sin normalizar, Google ve dos URLs por página.
 * La raíz de cada idioma es la excepción: ahí la barra sí forma parte de la URL.
 */
function normalizePath(pathname) {
  if (pathname === '/' || pathname === '/en/') return pathname;
  return pathname.replace(/\/$/, '');
}

/** Ruta equivalente en el otro idioma. El español vive en la raíz; el inglés bajo /en. */
function counterpart(pathname) {
  if (pathname === '/') return '/en/';
  if (pathname === '/en/') return '/';
  return pathname.startsWith('/en/') ? pathname.replace(/^\/en/, '') : `/en${pathname}`;
}

export default defineConfig({
  site: SITE,
  output: 'static',
  compressHTML: true,
  integrations: [
    sitemap({
      // Sin esto cada URL sale suelta: Google no sabe que /tools/srt-to-vtt y
      // /en/tools/srt-to-vtt son la misma página en dos idiomas. La opción `i18n`
      // nativa no sirve aquí porque el español no lleva prefijo de idioma.
      serialize(item) {
        const pathname = normalizePath(new URL(item.url).pathname);
        const isEn = pathname === '/en/' || pathname.startsWith('/en/');
        const es = isEn ? counterpart(pathname) : pathname;
        const en = isEn ? pathname : counterpart(pathname);

        return {
          ...item,
          url: `${SITE}${pathname}`,
          priority: priorityFor(pathname),
          changefreq: 'weekly',
          links: [
            { lang: 'es', url: `${SITE}${es}` },
            { lang: 'en', url: `${SITE}${en}` },
            { lang: 'x-default', url: `${SITE}${es}` },
          ],
        };
      },
    }),
  ],
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
