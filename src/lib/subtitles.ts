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

export interface SegmentOptions {
  /** Caracteres máximos por línea. */
  maxCharsPerLine: number;
  /** Líneas máximas por subtítulo. */
  maxLines: number;
  /** Velocidad de lectura objetivo, en caracteres por segundo. */
  cps: number;
  minDurationMs: number;
  maxDurationMs: number;
  /** Milisegundos desde donde empieza el primer subtítulo. */
  startMs: number;
}

/** Hueco entre subtítulos: sin él, un reproductor puede encadenarlos sin parpadeo. */
const GAP_MS = 80;

/**
 * Reparte un texto en líneas sin cortar palabras. Devuelve null cuando no cabe
 * en el número de líneas permitido: quien llama debe partir el texto en dos
 * subtítulos en vez de dejar una línea que se salga de la pantalla.
 */
function packLines(text: string, maxChars: number, maxLines: number): string[] | null {
  const words = text.split(' ');
  if (words.some((word) => word.length > maxChars)) return null;

  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) return null;

  return lines.length === 2 ? balance(words, maxChars) ?? lines : lines;
}

/**
 * Dos líneas de 39 y 10 caracteres son técnicamente válidas y se leen fatal.
 * Con dos líneas se busca el corte que más las iguale.
 */
function balance(words: string[], maxChars: number): string[] | null {
  let best: string[] | null = null;
  let bestGap = Infinity;

  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(' ');
    const second = words.slice(i).join(' ');
    if (first.length > maxChars || second.length > maxChars) continue;

    const gap = Math.abs(first.length - second.length);
    if (gap < bestGap) {
      bestGap = gap;
      best = [first, second];
    }
  }
  return best;
}

/**
 * Convierte un texto corrido en subtítulos. Corta primero por final de frase,
 * que es donde el ojo espera el corte, y solo parte por dentro cuando la frase
 * no cabe en un bloque.
 */
export function textToCues(text: string, options: SegmentOptions): Cue[] {
  const clean = normalize(text).replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const { maxCharsPerLine, maxLines } = options;
  const budget = maxCharsPerLine * maxLines;

  // El punto se queda pegado a la frase que cierra, que es donde el ojo espera
  // el corte. Lo que no quepa se parte después.
  const blocks = clean
    .split(/(?<=[.!?…])\s+/)
    .flatMap((sentence) => (sentence.length <= budget ? [sentence] : splitLong(sentence, budget)))
    .flatMap((block) => fit(block, maxCharsPerLine, maxLines))
    .filter((block) => block.lines.length > 0);

  const cues: Cue[] = [];
  let cursor = Math.max(0, options.startMs);

  for (const block of blocks) {
    const duration = Math.min(
      options.maxDurationMs,
      Math.max(options.minDurationMs, (block.length / options.cps) * 1000),
    );
    cues.push({ start: cursor, end: cursor + duration, lines: block.lines });
    cursor += duration + GAP_MS;
  }

  return cues;
}

/**
 * Un bloque que no se puede repartir en las líneas permitidas se corta por la
 * mitad y se vuelve a intentar con cada parte.
 */
function fit(
  text: string,
  maxChars: number,
  maxLines: number,
): { lines: string[]; length: number }[] {
  const lines = packLines(text, maxChars, maxLines);
  if (lines) return [{ lines, length: text.length }];

  const words = text.split(' ');
  if (words.length < 2) return [{ lines: [text], length: text.length }];

  const middle = Math.ceil(words.length / 2);
  return [
    ...fit(words.slice(0, middle).join(' '), maxChars, maxLines),
    ...fit(words.slice(middle).join(' '), maxChars, maxLines),
  ];
}

/** Frase que no cabe en un bloque: se parte por comas, y si no, por palabras. */
function splitLong(sentence: string, budget: number): string[] {
  const parts: string[] = [];
  let current = '';

  for (const chunk of sentence.split(/(?<=,)\s+/)) {
    const candidate = current ? `${current} ${chunk}` : chunk;
    if (candidate.length <= budget) {
      current = candidate;
      continue;
    }
    if (current) parts.push(current);
    // Ni siquiera el trozo suelto cabe: se corta por palabras.
    if (chunk.length > budget) {
      let piece = '';
      for (const word of chunk.split(' ')) {
        const next = piece ? `${piece} ${word}` : word;
        if (next.length <= budget) {
          piece = next;
        } else {
          parts.push(piece);
          piece = word;
        }
      }
      current = piece;
    } else {
      current = chunk;
    }
  }
  if (current) parts.push(current);
  return parts;
}
