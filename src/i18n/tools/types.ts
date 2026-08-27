/**
 * Formas del copy de las herramientas. Un dict por idioma (es.ts / en.ts), con
 * la misma estructura que ui.ts: nada de strings sueltos en los componentes.
 */
import type { ToolCategory, ToolSlug } from '../../lib/tools';

export interface ToolFaqItem {
  readonly q: string;
  readonly a: string;
}

/** Lo que hace única e indexable a cada página de herramienta. */
export interface ToolContent {
  readonly slug: ToolSlug;
  /** Tarjeta del hub y de los enlaces cruzados. */
  readonly cardTitle: string;
  readonly cardBlurb: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly tagline: string;
  /** Párrafos educativos: aquí es donde vive el long-tail. */
  readonly intro: readonly string[];
  readonly howTo: readonly string[];
  readonly faq: readonly ToolFaqItem[];
  /** Otras herramientas a las que enlaza esta página. Curado, no aleatorio. */
  readonly related: readonly ToolSlug[];
}

/** Textos del armazón, compartidos por todas las páginas de herramienta. */
export interface ToolsChrome {
  readonly breadcrumbHome: string;
  readonly breadcrumbTools: string;
  readonly howToTitle: string;
  readonly faqTitle: string;
  readonly relatedTitle: string;
  readonly ctaTitle: string;
  readonly ctaSub: string;
  readonly ctaButton: string;
  readonly ctaNote: string;
}

export interface ToolsIndexCopy {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly sub: string;
  readonly countLabel: string;
}

/** Controles comunes a las seis herramientas de subtítulos. */
export interface SubtitleUi {
  readonly dropLabel: string;
  readonly browseLabel: string;
  readonly pasteLabel: string;
  readonly pastePlaceholder: string;
  readonly fileLabel: string;
  readonly clearLabel: string;
  readonly resultLabel: string;
  readonly copyLabel: string;
  readonly copiedLabel: string;
  readonly downloadLabel: string;
  /** Contiene el token "{n}". */
  readonly cuesLabel: string;
  /** Versión en singular de cuesLabel: "1 subtítulos" queda mal. */
  readonly cueLabelOne: string;
  readonly emptyError: string;
  readonly parseError: string;
}

export interface ToolsWidgets {
  /** Textos del desplegable propio, compartido por todos los widgets. */
  readonly combo: {
    readonly searchPlaceholder: string;
    readonly noResults: string;
  };
  readonly subtitle: SubtitleUi;
  readonly plain: {
    readonly formatLabel: string;
    readonly modeLines: string;
    readonly modeParagraphs: string;
  };
  readonly sync: {
    readonly shiftLabel: string;
    readonly shiftHint: string;
    readonly secondsSuffix: string;
    readonly fpsLabel: string;
    readonly fpsFrom: string;
    readonly fpsTo: string;
    readonly fpsNone: string;
    readonly previewLabel: string;
    readonly beforeLabel: string;
    readonly afterLabel: string;
    readonly negativeWarning: string;
  };
  readonly bilingual: {
    readonly originalLabel: string;
    readonly translationLabel: string;
    readonly orderLabel: string;
    readonly orderOriginalFirst: string;
    readonly orderTranslationFirst: string;
    readonly separatorLabel: string;
    readonly separatorNone: string;
    readonly countMismatch: string;
    readonly needBoth: string;
  };
  readonly checker: {
    readonly presetLabel: string;
    readonly presetNetflix: string;
    readonly presetBbc: string;
    readonly presetCustom: string;
    readonly maxCpsLabel: string;
    readonly maxCharsPerLineLabel: string;
    readonly maxLinesLabel: string;
    readonly minDurationLabel: string;
    readonly maxDurationLabel: string;
    readonly summaryOk: string;
    /** Contiene "{n}". */
    readonly summaryIssues: string;
    readonly summaryIssuesOne: string;
    readonly colCue: string;
    readonly colTime: string;
    readonly colIssue: string;
    readonly issueCps: string;
    readonly issueLineLength: string;
    readonly issueLines: string;
    readonly issueShort: string;
    readonly issueLong: string;
    readonly issueOverlap: string;
  };
  readonly stt: {
    readonly langLabel: string;
    readonly startLabel: string;
    readonly stopLabel: string;
    readonly listeningLabel: string;
    readonly unsupported: string;
    readonly permissionDenied: string;
    readonly transcriptLabel: string;
    readonly transcriptPlaceholder: string;
    readonly copyLabel: string;
    readonly copiedLabel: string;
    readonly downloadTxt: string;
    readonly downloadSrt: string;
    readonly clearLabel: string;
    readonly engineNote: string;
  };
  readonly tts: {
    readonly textLabel: string;
    readonly textPlaceholder: string;
    readonly voiceLabel: string;
    readonly rateLabel: string;
    readonly pitchLabel: string;
    readonly speakLabel: string;
    readonly pauseLabel: string;
    readonly resumeLabel: string;
    readonly stopLabel: string;
    readonly noVoices: string;
    readonly unsupported: string;
    readonly downloadNote: string;
  };
  readonly recorder: {
    readonly recordLabel: string;
    readonly pauseLabel: string;
    readonly resumeLabel: string;
    readonly stopLabel: string;
    readonly discardLabel: string;
    readonly downloadLabel: string;
    readonly levelLabel: string;
    readonly readyLabel: string;
    readonly recordingLabel: string;
    readonly pausedLabel: string;
    readonly permissionDenied: string;
    readonly unsupported: string;
    readonly formatNote: string;
  };
  readonly codes: {
    readonly searchLabel: string;
    readonly searchPlaceholder: string;
    readonly colName: string;
    readonly colNative: string;
    readonly colIso1: string;
    readonly colIso3: string;
    readonly colLocales: string;
    readonly noResults: string;
    /** Contiene "{n}". */
    readonly countLabel: string;
    readonly countLabelOne: string;
  };
  readonly detector: {
    readonly textLabel: string;
    readonly textPlaceholder: string;
    readonly resultLabel: string;
    readonly confidenceLabel: string;
    readonly confidenceHigh: string;
    readonly confidenceMedium: string;
    readonly confidenceLow: string;
    readonly runnersUpLabel: string;
    readonly tooShort: string;
    readonly noMatch: string;
  };
  readonly wpm: {
    readonly modeLabel: string;
    readonly modeFromWords: string;
    readonly modeFromMinutes: string;
    readonly wordsLabel: string;
    readonly minutesLabel: string;
    readonly langLabel: string;
    readonly paceLabel: string;
    readonly paceSlow: string;
    readonly paceNormal: string;
    readonly paceFast: string;
    readonly readingResult: string;
    readonly speakingResult: string;
    readonly wordsResult: string;
    readonly wpmSuffix: string;
    readonly note: string;
  };
  readonly transcription: {
    readonly audioLabel: string;
    readonly minutesSuffix: string;
    readonly qualityLabel: string;
    readonly qualityClean: string;
    readonly qualityNormal: string;
    readonly qualityHard: string;
    readonly manualResult: string;
    readonly ecoResult: string;
    readonly savedResult: string;
    readonly note: string;
  };
}

export interface ToolsDict {
  readonly chrome: ToolsChrome;
  readonly index: ToolsIndexCopy;
  readonly categories: Record<ToolCategory, string>;
  readonly widgets: ToolsWidgets;
  readonly tools: Record<ToolSlug, ToolContent>;
}
