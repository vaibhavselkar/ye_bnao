import './src/i18n';
import { useEffect, useState, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initRTL } from './src/utils/rtl';
import { useAppFonts } from './src/hooks/useAppFonts';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep splash screen visible while we initialize RTL + fonts
SplashScreen.preventAutoHideAsync();

function AppInner() {
  const [lang, setLang] = useState('en');
  const [rtlReady, setRtlReady] = useState(false);
  const { fontsLoaded } = useAppFonts(lang);

  useEffect(() => {
    async function bootstrap() {
      // 1. Read saved language for font loading
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang) setLang(savedLang);

      // 2. Apply RTL if needed — must happen before first render
      const { changed } = await initRTL();

      if (changed) {
        // RTL state flipped — need a JS reload for layout to take effect.
        // Try expo-updates; if not available fall back to graceful handling.
        try {
          const Updates = require('expo-updates');
          await Updates.reloadAsync();
          return; // App will restart — stop here
        } catch {
          // expo-updates not available in this environment — continue anyway.
          // Layout will correct itself on next cold start.
        }
      }

      setRtlReady(true);
    }
    bootstrap();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (rtlReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [rtlReady, fontsLoaded]);

  if (!rtlReady || !fontsLoaded) {
    return (
      <View style={styles.loading} onLayout={onLayoutRootView}>
        <ActivityIndicator size="large" color="#C0392B" />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppInner />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0' },
});
