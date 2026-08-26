/**
 * Cableado común de las herramientas de subtítulos que transforman un archivo
 * en otro: cargar (por archivo o pegado), parsear, transformar, mostrar,
 * copiar y descargar. Cada widget solo aporta su función de transformación.
 *
 * El widget declara su marcado con atributos data-*, que es lo que busca esta
 * función dentro de su raíz.
 */
import { type Cue, type SubtitleFormat, detectFormat, parseSubtitles } from './subtitles';
import { copyText, downloadText, flashLabel, pluralize } from './download';
import { reportToolUseOnce } from './tool-analytics';

export interface TransformInput {
  cues: Cue[];
  format: SubtitleFormat;
  filename: string;
}

export interface TransformOutput {
  text: string;
  filename: string;
  /** Aviso no bloqueante: el resultado es válido pero conviene mirarlo. */
  warning?: string;
}

export interface SubtitleWidgetOptions {
  root: HTMLElement;
  transform: (input: TransformInput) => TransformOutput;
  labels: {
    parseError: string;
    emptyError: string;
    copiedLabel: string;
    /** Contiene "{n}". */
    cuesLabel: string;
    cueLabelOne: string;
  };
  /** Se dispara al cargar o limpiar, para que el widget ajuste sus controles. */
  onStateChange?: (loaded: boolean) => void;
}

export function initSubtitleWidget(options: SubtitleWidgetOptions) {
  const { root, transform, labels } = options;

  const paste = root.querySelector<HTMLTextAreaElement>('[data-paste]');
  const fileRow = root.querySelector<HTMLElement>('[data-file]');
  const fileName = root.querySelector<HTMLElement>('[data-file-name]');
  const output = root.querySelector<HTMLElement>('[data-output]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  const errorBox = root.querySelector<HTMLElement>('[data-error]');
  const warnBox = root.querySelector<HTMLElement>('[data-warning]');
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-copy]');
  const downloadBtn = root.querySelector<HTMLButtonElement>('[data-download]');
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-clear]');

  let source = '';
  let sourceName = 'subtitles';
  let result: TransformOutput | null = null;

  function setError(message: string | null) {
    if (!errorBox) return;
    errorBox.textContent = message ?? '';
    errorBox.hidden = !message;
  }

  function setWarning(message: string | undefined) {
    if (!warnBox) return;
    warnBox.textContent = message ?? '';
    warnBox.hidden = !message;
  }

  function setActionsEnabled(enabled: boolean) {
    if (copyBtn) copyBtn.disabled = !enabled;
    if (downloadBtn) downloadBtn.disabled = !enabled;
  }

  function render() {
    setError(null);
    setWarning(undefined);

    if (!source.trim()) {
      result = null;
      if (output) output.textContent = '';
      if (count) count.textContent = '';
      setActionsEnabled(false);
      options.onStateChange?.(false);
      return;
    }

    let cues: Cue[];
    const format = detectFormat(source);
    try {
      cues = parseSubtitles(source);
    } catch {
      result = null;
      if (output) output.textContent = '';
      if (count) count.textContent = '';
      setActionsEnabled(false);
      setError(labels.parseError);
      options.onStateChange?.(false);
      return;
    }

    result = transform({ cues, format, filename: sourceName });
    // Un resultado válido es la señal de que la herramienta se usó de verdad.
    reportToolUseOnce('convert');
    if (output) output.textContent = result.text;
    if (count) count.textContent = pluralize(cues.length, labels.cuesLabel, labels.cueLabelOne);
    setWarning(result.warning);
    setActionsEnabled(true);
    options.onStateChange?.(true);
  }

  function load(text: string, name: string) {
    source = text;
    sourceName = name.replace(/\.[^.]+$/, '') || 'subtitles';

    if (!text.trim()) {
      setError(labels.emptyError);
      return;
    }
    if (fileRow && fileName) {
      fileName.textContent = name;
      fileRow.hidden = false;
    }
    if (paste) paste.value = text;
    render();
  }

  root.addEventListener('tool:file', (event) => {
    const detail = (event as CustomEvent<{ name: string; text: string }>).detail;
    reportToolUseOnce('load_file');
    load(detail.text, detail.name);
  });

  paste?.addEventListener('input', () => {
    source = paste.value;
    if (fileRow) fileRow.hidden = true;
    render();
  });

  clearBtn?.addEventListener('click', () => {
    source = '';
    sourceName = 'subtitles';
    if (paste) paste.value = '';
    if (fileRow) fileRow.hidden = true;
    render();
  });

  copyBtn?.addEventListener('click', async () => {
    if (!result) return;
    if (await copyText(result.text)) flashLabel(copyBtn, labels.copiedLabel);
  });

  downloadBtn?.addEventListener('click', () => {
    if (!result) return;
    downloadText(result.filename, result.text);
  });

  setActionsEnabled(false);

  return { rerun: render };
}
