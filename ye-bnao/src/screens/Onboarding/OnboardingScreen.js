import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { INDIAN_STATES } from '../../constants/states';
import { initTrial } from '../../utils/subscription';

const HEALTH_OPTIONS = ['Diabetes', 'Hypertension', 'Hypothyroidism', 'PCOS', 'Heart Disease', 'Anaemia', 'Pregnancy', 'Kidney Disease'];
const DIET_OPTIONS = [
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'nonVegetarian', label: '🍗 Non-Veg' },
  { value: 'eggetarian', label: '🥚 Eggetarian' },
];

export default function OnboardingScreen({ navigation }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('MH');
  const [cuisine, setCuisine] = useState('');
  const [members, setMembers] = useState([]);

  const selectedState = INDIAN_STATES.find(s => s.code === stateCode);

  const addMember = () => setMembers([...members, {
    id: Date.now().toString(), name: '', age: '', diet: 'vegetarian', spice: 3, health: [],
  }]);

  const updateMember = (id, field, value) =>
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));

  const saveAndContinue = async (profile) => {
    await AsyncStorage.setItem('family_profile', JSON.stringify(profile));
    await initTrial();
    navigation.replace('Main');
  };

  const handleComplete = async () => {
    if (!name.trim()) { Alert.alert('Please enter your name'); return; }
    const profile = {
      name, city, state: stateCode,
      cuisine: cuisine || selectedState?.cuisine || 'Mixed Indian',
      members: members.length > 0 ? members : [{ id: '1', name, age: '30', diet: 'vegetarian', spice: 3, health: [] }],
    };
    await saveAndContinue(profile);
  };

  // Skip — save a minimal profile so the app has something to work with
  const handleSkip = async () => {
    const profile = {
      name: 'User',
      city: '',
      state: 'MH',
      cuisine: 'Mixed Indian',
      members: [{ id: '1', name: 'User', age: '25', diet: 'vegetarian', spice: 3, health: [] }],
      isDefault: true,
    };
    await saveAndContinue(profile);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Skip button top-right */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipTop}>
          <Text style={styles.skipTopText}>Skip →</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
          <Text style={styles.title}>
            {step === 1 ? '🏠 ' + t('onboarding.step2Title', 'Your Region & Cuisine') : '👨‍👩‍👧 ' + t('onboarding.step1Title', 'Family Members')}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Helps us suggest regional recipes'
              : 'Optional — add family members for personalised plans'}
          </Text>
        </View>

        {step === 1 && (
          <View>
            <Text style={styles.label}>{t('onboarding.yourName', 'Your Name')} *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your name" />

            <Text style={styles.label}>{t('onboarding.yourCity', 'Your City')}</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Mumbai, Delhi..." />

            <Text style={styles.label}>{t('onboarding.yourState', 'Your State')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateRow}>
              {INDIAN_STATES.map(s => (
                <TouchableOpacity
                  key={s.code}
                  style={[styles.stateChip, stateCode === s.code && styles.stateChipActive]}
                  onPress={() => setStateCode(s.code)}
                >
                  <Text style={[styles.stateChipText, stateCode === s.code && styles.stateChipTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>{t('onboarding.cuisineStyle', 'Cuisine Style')}</Text>
            <TextInput
              style={styles.input} value={cuisine} onChangeText={setCuisine}
              placeholder={selectedState?.cuisine || 'e.g. Maharashtrian, Bengali...'}
            />

            <TouchableOpacity style={styles.btn} onPress={() => setStep(2)}>
              <Text style={styles.btnText}>{t('common.next', 'Next')} →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <TouchableOpacity style={styles.addMemberBtn} onPress={addMember}>
              <Text style={styles.addMemberText}>+ {t('onboarding.addFamilyMember', 'Add Family Member')}</Text>
            </TouchableOpacity>

            {members.map((member, idx) => (
              <View key={member.id} style={styles.memberCard}>
                <Text style={styles.memberTitle}>👤 Member {idx + 1}</Text>
                <TextInput style={styles.input} value={member.name} onChangeText={v => updateMember(member.id, 'name', v)} placeholder="Name" />
                <TextInput style={styles.input} value={member.age} onChangeText={v => updateMember(member.id, 'age', v)} placeholder="Age" keyboardType="number-pad" />

                <Text style={styles.sublabel}>Diet Type</Text>
                <View style={styles.chipRow}>
                  {DIET_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.chip, member.diet === opt.value && styles.chipActive]}
                      onPress={() => updateMember(member.id, 'diet', opt.value)}
                    >
                      <Text style={[styles.chipText, member.diet === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sublabel}>Spice Level: {member.spice}/5</Text>
                <View style={styles.spiceRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity key={n} onPress={() => updateMember(member.id, 'spice', n)}>
                      <Text style={{ fontSize: 28, opacity: member.spice >= n ? 1 : 0.25 }}>🌶</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sublabel}>Health Conditions</Text>
                <View style={styles.chipRow}>
                  {HEALTH_OPTIONS.map(h => {
                    const sel = member.health.includes(h);
                    return (
                      <TouchableOpacity
                        key={h}
                        style={[styles.chip, sel && styles.chipHealth]}
                        onPress={() => updateMember(member.id, 'health', sel ? member.health.filter(x => x !== h) : [...member.health, h])}
                      >
                        <Text style={[styles.chipText, sel && styles.chipTextActive]}>{h}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1.5 }]} onPress={handleComplete}>
                <Text style={styles.btnText}>{t('onboarding.getStarted', 'Get Started')} 🎉</Text>
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
  scroll: { padding: 20, paddingBottom: 40 },
  skipTop: { alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: 8, marginBottom: 8 },
  skipTopText: { color: COLORS.text.muted, fontSize: 15 },
  header: { marginBottom: 24 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.text.muted, marginTop: 4 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 6, marginTop: 16 },
  sublabel: { fontSize: 14, fontWeight: '500', color: COLORS.text.muted, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text.primary },
  stateRow: { flexGrow: 0, marginBottom: 4 },
  stateChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  stateChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stateChipText: { fontSize: 13, color: COLORS.text.secondary },
  stateChipTextActive: { color: '#fff', fontWeight: 'bold' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addMemberBtn: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, borderStyle: 'dashed', paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  addMemberText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  memberCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  memberTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipHealth: { backgroundColor: COLORS.error, borderColor: COLORS.error },
  chipText: { fontSize: 13, color: COLORS.text.secondary },
  chipTextActive: { color: '#fff' },
  spiceRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backBtn: { flex: 1, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
});
