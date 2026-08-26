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
 * Descargas. La landing enlaza siempre `/download/mac`, que vercel.json redirige
 * al binario real: así publicar una versión nueva no invalida ningún enlace que
 * ya circule por ahí.
 */
export const DOWNLOAD = {
  mac: {
    path: '/download/mac',
    version: '0.2.4',
    minOS: 'macOS 14.4+',
    /** shasum -a 256 del .dmg publicado, para quien quiera verificarlo a mano. */
    sha256: '308a3d5086f49fb10e9be182b9e95e0fe46e79d27a1a8f464dc9d16bd05c7184',
  },
  appStore: 'https://apps.apple.com/app/id6791297799',
  playStore: 'https://play.google.com/store/apps/details?id=com.eco.mobile',
} as const;
