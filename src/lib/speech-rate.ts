/**
 * Velocidades de habla y de lectura, y ratios de transcripción. Los usan las
 * dos calculadoras. Son cifras de referencia del sector, no medidas nuestras:
 * sirven para estimar, no para facturar al minuto.
 */

export interface SpeechRate {
  /** Código ISO 639-1, para etiquetar la opción en el selector. */
  readonly code: string;
  /** Palabras por minuto leyendo en voz alta a ritmo de presentación. */
  readonly speaking: number;
  /** Palabras por minuto leyendo en silencio, texto de dificultad media. */
  readonly reading: number;
}

/**
 * Solo idiomas donde la palabra es una unidad de conteo estable. En japonés o
 * en chino la palabra no se delimita igual y una cifra en palabras por minuto
 * no significaría lo mismo.
 */
export const SPEECH_RATES: readonly SpeechRate[] = [
  { code: 'es', speaking: 130, reading: 220 },
  { code: 'en', speaking: 140, reading: 240 },
  { code: 'pt', speaking: 135, reading: 225 },
  { code: 'fr', speaking: 130, reading: 220 },
  { code: 'it', speaking: 140, reading: 225 },
  { code: 'de', speaking: 125, reading: 210 },
];

export type Pace = 'slow' | 'normal' | 'fast';

/** El ritmo pausado ya deja margen para respirar y para las pausas naturales. */
export const PACE_FACTOR: Record<Pace, number> = {
  slow: 0.82,
  normal: 1,
  fast: 1.2,
};

export function rateFor(code: string): SpeechRate {
  return SPEECH_RATES.find((r) => r.code === code) ?? SPEECH_RATES[0];
}

export type AudioQuality = 'clean' | 'normal' | 'hard';

/**
 * Minutos de trabajo por minuto de audio. `manual` es lo que cobran las
 * agencias de transcripción; `review` es lo que cuesta repasar y corregir una
 * transcripción automática en vez de escribirla desde cero.
 */
export const TRANSCRIPTION_RATIO: Record<AudioQuality, { manual: number; review: number }> = {
  clean: { manual: 4, review: 1 },
  normal: { manual: 6, review: 1.5 },
  hard: { manual: 8, review: 2.5 },
};

/**
 * "2 h 15 min" es más legible que "135 minutos" en cuanto pasa de una hora, y
 * por debajo del minuto lo único que sirve son los segundos.
 */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, minutes);
  if (safe < 1) return `${Math.round(safe * 60)} s`;

  const total = Math.round(safe);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
