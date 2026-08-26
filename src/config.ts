/**
 * Datos de sitio y analítica. Fuente única: nada de URLs, IDs ni versiones
 * repartidos por los componentes.
 */

export const SITE = {
  url: 'https://ecotranslate.app',
  name: 'Eco',
  legalName: 'Ingeniería Informática Auris SpA',
  email: 'hola@ecotranslate.app',
} as const;

/**
 * Umami autoalojado en el propio dominio, lo que evita buena parte del bloqueo
 * por listas de rastreadores. Ninguno de los dos valores es secreto.
 */
export const UMAMI = {
  scriptUrl: 'https://umami.auris.cl/script.js',
  websiteId: '3df672e0-3060-4153-a2cf-b67ea104dd04',
} as const;


/**
 * `astro build` corre en modo production tanto en producción como en los
 * previews de Vercel, así que import.meta.env.PROD no distingue entre ambos.
 * VERCEL_ENV sí, pero no se puede leer con import.meta.env: Vite solo expone al
 * cliente las variables con prefijo (PUBLIC_ / VITE_), y esta no lo tiene. Por
 * eso llega por `vite.define` desde astro.config.mjs, que corre en Node y sí ve
 * el entorno completo.
 */
export const IS_PRODUCTION = __ANALYTICS_ENABLED__;

/**
 * Los únicos hosts cuyos datos queremos en los informes. Se comprueba además en
 * runtime (src/lib/analytics.ts) porque IS_PRODUCTION solo mira la variable de
 * build: staging.ecotranslate.app existe, y bastaría reapuntar un alias para que
 * heredara un build de producción y empezara a contaminar las métricas.
 */
export const PRODUCTION_HOSTS = ['ecotranslate.app', 'www.ecotranslate.app'] as const;
/**
 * Dominios desde los que Umami tiene permitido enviar. Hace falta porque el script cuenta las
 * visitas por su cuenta, sin pasar por `track()`: la comprobación de hostname de analytics.ts
 * frena los eventos propios pero no las páginas vistas. Y staging.ecotranslate.app resultó ser
 * un alias del mismo deployment de producción, así que el script llegaba también allí.
 */
export const UMAMI_DOMAINS = PRODUCTION_HOSTS.join(',');

/**
 * Descargas. La landing enlaza siempre `/download/mac`, que vercel.json redirige
 * al binario real: así publicar una versión nueva no invalida ningún enlace que
 * ya circule por ahí.
 */
export const DOWNLOAD = {
  mac: {
    path: '/download/mac',
    version: '0.2.5',
    minOS: 'macOS 14.4+',
  },
  appStore: 'https://apps.apple.com/app/id6791297799',
  playStore: 'https://play.google.com/store/apps/details?id=com.eco.mobile',
} as const;
