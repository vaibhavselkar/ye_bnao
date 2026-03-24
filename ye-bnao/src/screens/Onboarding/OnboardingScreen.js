import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';
import { INDIAN_STATES } from '../../constants/states';
import { initTrial } from '../../utils/subscription';

const DIET_OPTIONS = [
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'nonVegetarian', label: '🍗 Non-Veg' },
  { value: 'eggetarian', label: '🥚 Eggetarian' },
];

const SPICE_OPTIONS = [
  { value: 1, label: '😌 Less Spicy' },
  { value: 3, label: '🌶 Medium' },
  { value: 5, label: '🔥 Very Spicy' },
];

const FOCUS_OPTIONS = [
  { value: 'normal', label: '🍽 Normal' },
  { value: 'high-protein', label: '💪 Protein Rich' },
  { value: 'green-veg', label: '🥦 More Veggies' },
  { value: 'weight-loss', label: '⚖️ Weight Loss' },
  { value: 'low-sugar', label: '🩺 Low Sugar' },
];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('MH');
  const [memberCount, setMemberCount] = useState(2);
  const [diet, setDiet] = useState('vegetarian');
  const [spice, setSpice] = useState(3);
  const [foodFocus, setFoodFocus] = useState('normal');

  const selectedState = INDIAN_STATES.find(s => s.code === stateCode);

  const saveAndGo = async (profile) => {
    await AsyncStorage.setItem('family_profile', JSON.stringify(profile));
    await initTrial();
    navigation.replace('Main');
  };

  const handleSkip = async () => {
    await saveAndGo({
      name: 'User', city: '', state: 'MH', cuisine: 'Mixed Indian',
      memberCount: 2, diet: 'vegetarian', spice: 3, foodFocus: 'normal',
      members: [{ id: '1', name: 'User', age: '25', diet: 'vegetarian', spice: 3, health: [] }],
      isDefault: true,
    });
  };

  const handleComplete = async () => {
    if (!name.trim()) { Alert.alert('Please enter your name'); return; }
    const profile = {
      name: name.trim(),
      city: city.trim(),
      state: stateCode,
      cuisine: selectedState?.cuisine || 'Mixed Indian',
      memberCount,
      diet,
      spice,
      foodFocus,
      members: [{ id: '1', name: name.trim(), age: '25', diet, spice, health: [] }],
    };
    await saveAndGo(profile);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={handleSkip} style={styles.skipTop}>
          <Text style={styles.skipTopText}>Skip →</Text>
        </TouchableOpacity>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {[1, 2].map(n => (
            <View key={n} style={[styles.stepDot, step >= n && styles.stepDotActive]} />
          ))}
        </View>

        {step === 1 && (
          <View>
            <Text style={styles.title}>🏠 Your Details</Text>
            <Text style={styles.subtitle}>Helps us suggest regional recipes</Text>

            <Text style={styles.label}>Your Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />

            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Mumbai, Delhi..." />

            <Text style={styles.label}>State</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {INDIAN_STATES.map(s => (
                <TouchableOpacity
                  key={s.code}
                  style={[styles.chip, stateCode === s.code && styles.chipActive]}
                  onPress={() => setStateCode(s.code)}
                >
                  <Text style={[styles.chipText, stateCode === s.code && styles.chipTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.btn} onPress={() => { if (!name.trim()) { Alert.alert('Please enter your name'); return; } setStep(2); }}>
              <Text style={styles.btnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>👨‍👩‍👧 Food Preferences</Text>
            <Text style={styles.subtitle}>We'll plan meals accordingly</Text>

            {/* Family size */}
            <Text style={styles.label}>Number of Family Members</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setMemberCount(Math.max(1, memberCount - 1))}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{memberCount}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setMemberCount(Math.min(15, memberCount + 1))}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Diet */}
            <Text style={styles.label}>Diet Type</Text>
            <View style={styles.chipRow}>
              {DIET_OPTIONS.map(o => (
                <TouchableOpacity key={o.value} style={[styles.chip, diet === o.value && styles.chipActive]} onPress={() => setDiet(o.value)}>
                  <Text style={[styles.chipText, diet === o.value && styles.chipTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Spice */}
            <Text style={styles.label}>Spice Level</Text>
            <View style={styles.chipRow}>
              {SPICE_OPTIONS.map(o => (
                <TouchableOpacity key={o.value} style={[styles.chip, spice === o.value && styles.chipActive]} onPress={() => setSpice(o.value)}>
                  <Text style={[styles.chipText, spice === o.value && styles.chipTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Food Focus */}
            <Text style={styles.label}>What kind of food?</Text>
            <View style={styles.chipRow}>
              {FOCUS_OPTIONS.map(o => (
                <TouchableOpacity key={o.value} style={[styles.chip, foodFocus === o.value && styles.chipActive]} onPress={() => setFoodFocus(o.value)}>
                  <Text style={[styles.chipText, foodFocus === o.value && styles.chipTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1.5 }]} onPress={handleComplete}>
                <Text style={styles.btnText}>Get Started 🎉</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 48 },
  skipTop: { alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: 8, marginBottom: 4 },
  skipTopText: { color: COLORS.text.muted, fontSize: 15 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stepDot: { width: 32, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.text.muted, marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text.secondary, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text.primary },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text.secondary },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 4 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  counterBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold', lineHeight: 26 },
  counterValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.text.primary, minWidth: 40, textAlign: 'center' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: { flex: 1, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
});
