/** Descarga y portapapeles: lo mismo en las trece herramientas, escrito una vez. */

export function downloadText(filename: string, text: string, mime = 'text/plain'): void {
  downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8` }));
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revocar en el mismo tick cancela la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * navigator.clipboard falla en contextos no seguros y cuando el documento no
 * tiene el foco, así que hay un plan B con el textarea de toda la vida.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Cambia el texto de un botón un momento para confirmar la acción. */
export function flashLabel(button: HTMLElement, temporary: string, ms = 1600): void {
  const original = button.dataset.originalLabel ?? button.textContent ?? '';
  button.dataset.originalLabel = original;
  button.textContent = temporary;
  window.setTimeout(() => {
    button.textContent = button.dataset.originalLabel ?? original;
  }, ms);
}

/** "1 subtítulos" queda mal en cualquier idioma: el singular va aparte. */
export function pluralize(n: number, many: string, one: string): string {
  return n === 1 ? one : many.replace('{n}', String(n));
}
