import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RTL_LANGUAGES } from '../constants/languages';

/**
 * Call this ONCE on app startup (before first render).
 * Reads saved language, syncs I18nManager.forceRTL, and returns
 * whether a reload is needed (RTL state changed since last launch).
 */
export async function initRTL() {
  try {
    const lang = await AsyncStorage.getItem('app_language');
    const shouldBeRTL = lang ? RTL_LANGUAGES.includes(lang) : false;

    if (shouldBeRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(shouldBeRTL);
      return { changed: true, isRTL: shouldBeRTL };
    }
    return { changed: false, isRTL: I18nManager.isRTL };
  } catch {
    return { changed: false, isRTL: false };
  }
}

/**
 * Call when the user explicitly changes language.
 * Applies forceRTL and returns whether a reload is needed.
 */
export function applyRTLForLanguage(langCode) {
  const shouldBeRTL = RTL_LANGUAGES.includes(langCode);
  const needsChange = shouldBeRTL !== I18nManager.isRTL;
  if (needsChange) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(shouldBeRTL);
  }
  return { needsChange, isRTL: shouldBeRTL };
}
