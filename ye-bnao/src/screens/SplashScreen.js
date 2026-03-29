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
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    let navigated = false;
    const navigate = (screen) => {
      if (!navigated) { navigated = true; navigation.replace(screen); }
    };

    const boot = async () => {
      try {
        const [langEntry, userEntry, profileEntry] = await AsyncStorage.multiGet([
          'app_language', 'user_data', 'family_profile',
        ]);
        const lang = langEntry[1];
        const user = userEntry[1];
        const profile = profileEntry[1];

        if (!lang) { navigate('LanguageSelection'); return; }

        // If we have stored user data, go straight in — no need to wait for Firebase
        if (user) {
          navigate(profile ? 'Main' : 'Onboarding');
          return;
        }

        // No stored user — wait briefly for Firebase, then go to Login
        const unsubscribe = onAuthStateChanged((firebaseUser) => {
          unsubscribe();
          if (firebaseUser) {
            navigate(profile ? 'Main' : 'Onboarding');
          } else {
            navigate('Login');
          }
        });
        setTimeout(() => navigate('Login'), 2000);
      } catch {
        navigate('LanguageSelection');
      }
    };

    boot();
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
