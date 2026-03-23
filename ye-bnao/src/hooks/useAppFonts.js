import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

/**
 * Maps language codes to the font family name they need.
 * Only Devanagari, Bengali, and Arabic-script (RTL) fonts are bundled —
 * most other Indian scripts (Tamil, Telugu, Kannada, etc.) are already
 * included as system fonts on Android/iOS and render correctly without
 * extra loading.
 */
export const LANGUAGE_FONTS = {
  hi: 'NotoSansDevanagari',
  mr: 'NotoSansDevanagari',
  ne: 'NotoSansDevanagari',
  mai: 'NotoSansDevanagari',
  kok: 'NotoSansDevanagari',
  doi: 'NotoSansDevanagari',
  brx: 'NotoSansDevanagari',
  sa: 'NotoSansDevanagari',
  bn: 'NotoSansBengali',
  as: 'NotoSansBengali',
  ur: 'NotoNaskhArabic',
  ks: 'NotoNaskhArabic',
  sd: 'NotoNaskhArabic',
  // ta, te, kn, gu, pa, ml, or, sat, mni → system fonts (no extra load needed)
};

/**
 * Returns the fontFamily string for a given language code.
 * Falls back to undefined (system default) for languages not in the map.
 */
export function getFontFamily(langCode) {
  return LANGUAGE_FONTS[langCode] || undefined;
}

/**
 * Hook that loads the Noto fonts needed for the given language.
 * Only loads if the font isn't already cached.
 *
 * NOTE: Requires these packages installed:
 *   npx expo install expo-font
 *   npx expo install @expo-google-fonts/noto-sans-devanagari
 *   npx expo install @expo-google-fonts/noto-sans-bengali
 *   npx expo install @expo-google-fonts/noto-naskh-arabic
 *
 * Until those are installed, this hook safely no-ops.
 */
export function useAppFonts(langCode) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const fontFamily = LANGUAGE_FONTS[langCode];
      if (!fontFamily) {
        // No special font needed for this language
        if (!cancelled) setFontsLoaded(true);
        return;
      }

      try {
        // Check if already loaded
        if (Font.isLoaded(fontFamily)) {
          if (!cancelled) setFontsLoaded(true);
          return;
        }

        // Dynamically import to avoid hard crash if packages not installed
        const fontMap = await loadFontForFamily(fontFamily);
        if (fontMap && !cancelled) {
          await Font.loadAsync(fontMap);
        }
        if (!cancelled) setFontsLoaded(true);
      } catch (e) {
        // Font load failed — app still works, just with system fallback font
        console.warn(`[fonts] Could not load ${fontFamily}:`, e.message);
        if (!cancelled) {
          setFontError(e);
          setFontsLoaded(true); // mark done so we don't block UI
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [langCode]);

  return { fontsLoaded, fontError };
}

/**
 * Attempts to load the correct @expo-google-fonts package for the given
 * font family. Uses dynamic require so missing packages don't crash the app.
 */
async function loadFontForFamily(fontFamily) {
  try {
    switch (fontFamily) {
      case 'NotoSansDevanagari': {
        const { NotoSansDevanagari_400Regular } =
          require('@expo-google-fonts/noto-sans-devanagari');
        return { NotoSansDevanagari: NotoSansDevanagari_400Regular };
      }
      case 'NotoSansBengali': {
        const { NotoSansBengali_400Regular } =
          require('@expo-google-fonts/noto-sans-bengali');
        return { NotoSansBengali: NotoSansBengali_400Regular };
      }
      case 'NotoNaskhArabic': {
        const { NotoNaskhArabic_400Regular } =
          require('@expo-google-fonts/noto-naskh-arabic');
        return { NotoNaskhArabic: NotoNaskhArabic_400Regular };
      }
      default:
        return null;
    }
  } catch {
    // Package not installed — silently continue with system font
    return null;
  }
}
