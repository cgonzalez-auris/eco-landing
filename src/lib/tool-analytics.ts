/**
 * Instrumentación de las herramientas. Sale por el mismo `track()` que el resto
 * del sitio, así que llega a Umami y a Vercel Web Analytics a la vez.
 *
 * Dos formas de contar, según el tipo de acción:
 *
 * - `reportToolUse` para las discretas (pulsar descargar, copiar, grabar): cada
 *   una interesa por separado.
 * - `reportToolUseOnce` para las continuas (teclear, mover un slider): ahí lo
 *   que se quiere medir es si la herramienta llegó a usarse, no cuántas teclas
 *   se pulsaron. Un evento por página y tipo de acción.
 */
import { track } from './analytics';

const reported = new Set<string>();

/** El slug lo pone ToolPage en el panel del widget: solo hay uno por página. */
function currentTool(): string {
  return document.querySelector<HTMLElement>('[data-tool]')?.dataset.tool ?? '';
}

export function reportToolUse(accion: string): void {
  track('tool_use', { herramienta: currentTool(), accion });
}

export function reportToolUseOnce(accion: string): void {
  const key = `${currentTool()}:${accion}`;
  if (reported.has(key)) return;
  reported.add(key);
  track('tool_use', { herramienta: currentTool(), accion });
}
