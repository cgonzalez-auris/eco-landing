/// <reference types="astro/client" />

/**
 * Inyectada por `vite.define` en astro.config.mjs. Existe porque dentro de un
 * <script> de cliente `import.meta.env` no se sustituye, así que no hay otra
 * forma de saber en el navegador si estamos en producción.
 */
declare const __ANALYTICS_ENABLED__: boolean;

interface ImportMetaEnv {
  /** ID del Meta Pixel. Vacío o ausente: el Pixel no se carga. */
  readonly PUBLIC_META_PIXEL_ID?: string;
}

interface Window {
  /** Umami autoalojado. Ausente fuera de producción. */
  umami?: {
    track: (
      event: string,
      data?: Record<string, string | number | boolean>,
    ) => void;
  };
  /** Meta Pixel. Solo existe si llegaste desde un anuncio de Meta y el ID está configurado. */
  fbq?: (...args: unknown[]) => void;
  /** Cola de Vercel Web Analytics. Ausente fuera de producción. */
  va?: (
    event: 'beforeSend' | 'event' | 'pageview',
    properties?: Record<string, unknown>,
  ) => void;
}
