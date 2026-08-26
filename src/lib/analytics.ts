/**
 * Punto único de salida de eventos. Habla con Umami y con Vercel Web Analytics a
 * la vez, y fuera de producción solo escribe en consola para poder verificar la
 * instrumentación en local sin ensuciar los datos reales.
 */

/** Vercel solo acepta valores planos; nada de objetos anidados ni arrays. */
export type TrackValue = string | number | boolean | null | undefined;
export type TrackProps = Record<string, TrackValue>;

/** Debe coincidir con PRODUCTION_HOSTS de src/config.ts. Se repite aquí porque
 *  este módulo se importa desde <script> de cliente, donde no llega la config
 *  del frontmatter. */
const PRODUCTION_HOSTS = ['ecotranslate.app', 'www.ecotranslate.app'];

function clean(props?: TrackProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!props) return out;
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === '') continue;
    out[key] = value;
  }
  return out;
}

/**
 * Segundo candado, en runtime. __ANALYTICS_ENABLED__ se resuelve en build a
 * partir de VERCEL_ENV, lo que ya deja fuera los previews; esto además impide
 * que staging.ecotranslate.app cuente como producción si algún día hereda un
 * build de producción por un cambio de alias.
 */
function isProductionHost(): boolean {
  return PRODUCTION_HOSTS.includes(location.hostname);
}

export function track(event: string, props?: TrackProps): void {
  const data = clean(props);

  if (!__ANALYTICS_ENABLED__ || !isProductionHost()) {
    console.debug(
      `%c analytics %c ${event}`,
      'background:#7C3AED;color:#fff;border-radius:3px;padding:0 2px',
      'color:#A78BFA',
      data,
    );
    return;
  }

  // Un fallo de un proveedor no puede impedir el envío al otro ni romper la
  // interacción que lo disparó.
  try {
    window.umami?.track(event, data);
  } catch {
    /* Umami bloqueado o aún sin cargar */
  }

  try {
    window.va?.('event', { name: event, data });
  } catch {
    /* Vercel Analytics bloqueado o aún sin cargar */
  }
}
