/**
 * Copy de las herramientas gratuitas. Vive aparte de ui.ts por volumen: son 13
 * herramientas con intro, pasos y FAQ propios en dos idiomas. Misma regla que
 * el resto del sitio, eso sí — ningún string escrito a mano en un componente.
 */
import type { Lang } from '../ui';
import type { ToolsDict } from './types';
import { toolsEs } from './es';
import { toolsEn } from './en';

export const toolsUi = { es: toolsEs, en: toolsEn } as const;

export function useToolTranslations(lang: Lang): ToolsDict {
  return toolsUi[lang];
}

export type { ToolContent, ToolFaqItem, ToolsDict } from './types';
