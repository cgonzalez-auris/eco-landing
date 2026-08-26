/// <reference types="astro/client" />

/**
 * Inyectada por `vite.define` en astro.config.mjs. Existe porque dentro de un
 * <script> de cliente `import.meta.env` no se sustituye, así que no hay otra
 * forma de saber en el navegador si estamos en producción.
 */
declare const __ANALYTICS_ENABLED__: boolean;

interface Window {
  /** Umami autoalojado. Ausente fuera de producción. */
  umami?: {
    track: (
      event: string,
      data?: Record<string, string | number | boolean>,
    ) => void;
  };
  /** Cola de Vercel Web Analytics. Ausente fuera de producción. */
  va?: (
    event: 'beforeSend' | 'event' | 'pageview',
    properties?: Record<string, unknown>,
  ) => void;
}
