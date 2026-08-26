/**
 * Parseo y serialización de SRT y WebVTT. Es la base de las seis herramientas
 * de subtítulos, así que el parser es deliberadamente tolerante: acepta los dos
 * formatos con el mismo código, aguanta BOM, CRLF, bloques sin numerar y
 * milisegundos separados por punto o por coma.
 */

export type SubtitleFormat = 'srt' | 'vtt';

export interface Cue {
  /** Milisegundos desde el inicio. */
  start: number;
  end: number;
  /** Las líneas del subtítulo, sin el salto final. */
  lines: string[];
}

export class SubtitleParseError extends Error {}

/** Quita BOM y unifica saltos de línea: casi todos los .srt del mundo vienen en CRLF. */
function normalize(text: string): string {
  return text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
}

export function detectFormat(text: string): SubtitleFormat {
  return /^\s*WEBVTT/.test(normalize(text)) ? 'vtt' : 'srt';
}

const TIMESTAMP = /(\d{1,3}):(\d{2}):(\d{2})[.,](\d{1,3})|(\d{1,3}):(\d{2})[.,](\d{1,3})/;

/** Acepta HH:MM:SS,mmm y MM:SS.mmm — VTT permite omitir la hora, SRT no. */
export function parseTimestamp(raw: string): number | null {
  const m = raw.trim().match(TIMESTAMP);
  if (!m) return null;
  const [h, min, s, ms] = m[1] !== undefined
    ? [m[1], m[2], m[3], m[4]]
    : ['0', m[5], m[6], m[7]];
  return (
    Number(h) * 3600000 +
    Number(min) * 60000 +
    Number(s) * 1000 +
    Number(ms.padEnd(3, '0'))
  );
}

export function formatTimestamp(ms: number, format: SubtitleFormat): string {
  const clamped = Math.max(0, Math.round(ms));
  const h = Math.floor(clamped / 3600000);
  const min = Math.floor((clamped % 3600000) / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  const rest = clamped % 1000;
  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  const sep = format === 'vtt' ? '.' : ',';
  return `${pad(h)}:${pad(min)}:${pad(s)}${sep}${pad(rest, 3)}`;
}

/** Bloques de VTT que no son subtítulos y hay que saltarse enteros. */
const BLOCK_KEYWORDS = /^(NOTE|STYLE|REGION)\b/;

/**
 * Un solo parser para los dos formatos: lo que delimita un subtítulo es la
 * línea con `-->`, y eso es igual en SRT y en VTT. Lo que venga justo antes
 * (número de bloque en SRT, identificador con nombre en VTT) se descarta.
 */
export function parseSubtitles(text: string): Cue[] {
  const lines = normalize(text).split('\n');
  const cues: Cue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (BLOCK_KEYWORDS.test(line.trim())) {
      while (i < lines.length && lines[i].trim() !== '') i++;
      continue;
    }

    if (!line.includes('-->')) continue;

    const [rawStart, rawRest] = line.split('-->');
    const start = parseTimestamp(rawStart);
    // En VTT, tras el tiempo final vienen los ajustes de posición: align, line…
    const end = parseTimestamp((rawRest ?? '').trim().split(/\s+/)[0] ?? '');
    if (start === null || end === null) continue;

    const body: string[] = [];
    i++;
    while (i < lines.length && lines[i].trim() !== '') {
      body.push(lines[i]);
      i++;
    }

    cues.push({ start, end, lines: body });
  }

  if (!cues.length) {
    throw new SubtitleParseError('No se encontró ningún subtítulo.');
  }
  return cues;
}

/**
 * Etiquetas propias de VTT que SRT no entiende. Las de formato que SRT sí
 * admite (i, b, u) se dejan: son las únicas que sobreviven al viaje.
 */
export function stripVttTags(text: string): string {
  return text
    .replace(/<\/?(?:c|v|lang|ruby|rt)(?:\.[^\s>]+)?(?:[^>]*)>/gi, '')
    .replace(/<\d{1,3}:\d{2}:\d{2}[.,]\d{1,3}>/g, '');
}

export function toSrt(cues: Cue[]): string {
  return (
    cues
      .map((cue, i) => {
        const body = cue.lines.map(stripVttTags).join('\n');
        return `${i + 1}\n${formatTimestamp(cue.start, 'srt')} --> ${formatTimestamp(cue.end, 'srt')}\n${body}`;
      })
      .join('\n\n') + '\n'
  );
}

export function toVtt(cues: Cue[]): string {
  const body = cues
    .map(
      (cue, i) =>
        `${i + 1}\n${formatTimestamp(cue.start, 'vtt')} --> ${formatTimestamp(cue.end, 'vtt')}\n${cue.lines.join('\n')}`,
    )
    .join('\n\n');
  return `WEBVTT\n\n${body}\n`;
}

export function serialize(cues: Cue[], format: SubtitleFormat): string {
  return format === 'vtt' ? toVtt(cues) : toSrt(cues);
}

/** Quita todo el formato para quedarse con texto legible. */
export function plainText(cue: Cue): string {
  return stripVttTags(cue.lines.join(' '))
    .replace(/<\/?[bius]>/gi, '')
    .replace(/\{\\[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
