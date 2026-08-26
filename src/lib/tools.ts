/**
 * Registro de las herramientas gratuitas. Es la fuente única del orden, la
 * categoría y las rutas: el hub, el sitemap y los enlaces cruzados salen todos
 * de aquí. El copy vive aparte, en src/i18n/tools/.
 */
import type { Lang } from '../i18n/ui';

export const TOOL_SLUGS = [
  // Subtítulos
  'srt-to-vtt',
  'vtt-to-srt',
  'srt-to-text',
  'subtitle-sync',
  'bilingual-subtitles',
  'subtitle-checker',
  // Voz
  'speech-to-text',
  'text-to-speech',
  'audio-recorder',
  // Idiomas
  'language-codes',
  'language-detector',
  // Calculadoras
  'words-to-minutes',
  'transcription-time',
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export type ToolCategory = 'subtitles' | 'voice' | 'languages' | 'calculators';

/** Orden en que aparecen las categorías en el hub. */
export const CATEGORY_ORDER: readonly ToolCategory[] = [
  'subtitles',
  'voice',
  'languages',
  'calculators',
];

const CATEGORY_OF: Record<ToolSlug, ToolCategory> = {
  'srt-to-vtt': 'subtitles',
  'vtt-to-srt': 'subtitles',
  'srt-to-text': 'subtitles',
  'subtitle-sync': 'subtitles',
  'bilingual-subtitles': 'subtitles',
  'subtitle-checker': 'subtitles',
  'speech-to-text': 'voice',
  'text-to-speech': 'voice',
  'audio-recorder': 'voice',
  'language-codes': 'languages',
  'language-detector': 'languages',
  'words-to-minutes': 'calculators',
  'transcription-time': 'calculators',
};

export function categoryOf(slug: ToolSlug): ToolCategory {
  return CATEGORY_OF[slug];
}

/** Slugs de una categoría, en el orden de TOOL_SLUGS. */
export function slugsIn(category: ToolCategory): ToolSlug[] {
  return TOOL_SLUGS.filter((slug) => CATEGORY_OF[slug] === category);
}

/**
 * Los slugs son los mismos en los dos idiomas — solo cambia el prefijo — así
 * que hreflang y los enlaces cruzados se derivan sin una segunda tabla.
 */
export function toolPath(slug: ToolSlug, lang: Lang): string {
  return lang === 'en' ? `/en/tools/${slug}` : `/tools/${slug}`;
}

export function toolsIndexPath(lang: Lang): string {
  return lang === 'en' ? '/en/tools' : '/tools';
}

export function toolAlternates(slug: ToolSlug): { es: string; en: string } {
  return { es: toolPath(slug, 'es'), en: toolPath(slug, 'en') };
}

export const TOOLS_INDEX_ALTERNATES = { es: '/tools', en: '/en/tools' } as const;

/**
 * Herramientas en las que el usuario pone algo suyo — un archivo, su voz, un
 * texto. Solo ahí tiene sentido el sello de que nada se sube: en una
 * calculadora o en una tabla de códigos no significa nada.
 */
const HANDLES_USER_DATA = new Set<ToolSlug>([
  ...slugsIn('subtitles'),
  ...slugsIn('voice'),
  'language-detector',
]);

export function handlesUserData(slug: ToolSlug): boolean {
  return HANDLES_USER_DATA.has(slug);
}

/** Las que se destacan en el footer, presente en todas las páginas del sitio. */
export const FOOTER_TOOLS: readonly ToolSlug[] = [
  'srt-to-vtt',
  'subtitle-sync',
  'speech-to-text',
  'text-to-speech',
  'language-codes',
];
