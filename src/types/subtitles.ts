// src/types/subtitles.ts

/**
 * Supported languages for subtitles and translations
 * Matches backend SUPPORTED_LANGUAGES list
 */
export const SUPPORTED_LANGUAGES = [
  // Major World Languages
  { code: 'en', name: 'English', nativeName: 'English', region: 'world' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'world' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'world' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'world' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'world' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'world' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'world' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'world' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'world' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'world' },

  // Key African Languages
  { code: 'kri', name: 'Krio', nativeName: 'Krio', region: 'africa' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', region: 'africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', region: 'africa' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'africa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', region: 'africa' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export type LanguageRegion = 'world' | 'africa';

export interface SupportedLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  region: LanguageRegion;
}

/**
 * Subtitle chunk received from WebSocket
 * Matches backend SubtitleChunkDto
 */
export interface SubtitleChunk {
  sessionId: string;
  text: string;
  language: string;
  timestamp: string; // ISO8601
  duration: number; // milliseconds
}

/**
 * Active subtitle with display metadata
 */
export interface ActiveSubtitle extends SubtitleChunk {
  id: string;
  translatedText?: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Translation request payload
 */
export interface TranslationRequest {
  messageId: string;
  targetLanguage: string;
}

/**
 * Translation response from WebSocket
 */
export interface TranslationResponse {
  success: boolean;
  event?: string;
  data?: {
    messageId: string;
    targetLanguage: string;
    translatedText: string;
  };
  error?: string;
}

/**
 * Subtitle display preferences
 */
export type SubtitleFontSize = 'small' | 'medium' | 'large';
export type SubtitlePosition = 'bottom' | 'top';

export interface SubtitlePreferences {
  enabled: boolean;
  fontSize: SubtitleFontSize;
  backgroundColor: string;
  textColor: string;
  position: SubtitlePosition;
  preferredLanguage: string | null; // null = auto-detect
  showOriginalWithTranslation: boolean;
}

/**
 * Font size mappings for subtitle display
 */
export const SUBTITLE_FONT_SIZES: Record<SubtitleFontSize, string> = {
  small: '0.875rem',
  medium: '1.125rem',
  large: '1.5rem',
};

/**
 * Default subtitle preferences
 */
export const DEFAULT_SUBTITLE_PREFERENCES: SubtitlePreferences = {
  enabled: false,
  fontSize: 'medium',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  textColor: '#ffffff',
  position: 'bottom',
  preferredLanguage: null,
  showOriginalWithTranslation: false,
};

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): SupportedLanguage | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Get languages grouped by region
 */
export function getLanguagesByRegion(): Record<LanguageRegion, SupportedLanguage[]> {
  return {
    world: SUPPORTED_LANGUAGES.filter((lang) => lang.region === 'world'),
    africa: SUPPORTED_LANGUAGES.filter((lang) => lang.region === 'africa'),
  };
}

/**
 * Detect browser language and match to supported language
 */
export function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0];
  const supported = SUPPORTED_LANGUAGES.find((lang) => lang.code === browserLang);
  return supported ? supported.code : 'en';
}
