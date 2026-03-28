import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { onAuthStateChanged } from '../services/firebaseAuth';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    let navigated = false;

    const navigate = (screen) => {
      if (!navigated) {
        navigated = true;
        navigation.replace(screen);
      }
    };

    // Wait for Firebase to resolve auth state, then route
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      try {
        const lang = await AsyncStorage.getItem('app_language');
        if (!lang) { navigate('LanguageSelection'); return; }

        // Guest users are stored locally without a Firebase account
        const storedUser = await AsyncStorage.getItem('user_data');
        const isGuest = storedUser ? JSON.parse(storedUser).isGuest : false;

        const isLoggedIn = !!firebaseUser || isGuest;
        if (!isLoggedIn) { navigate('Login'); return; }

        const profile = await AsyncStorage.getItem('family_profile');
        navigate(profile ? 'Main' : 'Onboarding');
      } catch {
        navigate('LanguageSelection');
      }
    });

    // Fallback — if Firebase auth takes too long (e.g. no internet)
    const fallback = setTimeout(async () => {
      try {
        const lang = await AsyncStorage.getItem('app_language');
        const user = await AsyncStorage.getItem('user_data');
        const profile = await AsyncStorage.getItem('family_profile');
        if (!lang) navigate('LanguageSelection');
        else if (!user) navigate('Login');
        else if (!profile) navigate('Onboarding');
        else navigate('Main');
      } catch {
        navigate('LanguageSelection');
      }
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>🍛</Text>
        <Text style={styles.appName}>Ye Bnao</Text>
        <Text style={styles.tagline}>यह बनाओ</Text>
        <Text style={styles.subtitle}>Your AI Cooking Companion</Text>
      </Animated.View>
      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Made with ❤️ for Indian Families</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  emoji: { fontSize: 80, marginBottom: 16 },
  appName: { fontSize: 48, fontWeight: 'bold', color: COLORS.secondary, letterSpacing: 2 },
  tagline: { fontSize: 28, color: '#FFFFFF', marginTop: 4 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  bottom: { position: 'absolute', bottom: 40 },
  bottomText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
});
