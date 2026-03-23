import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { leftoverAPI } from '../../services/api';
import { COLORS } from '../../constants/colors';

export default function LeftoverScreen({ navigation }) {
  const { t } = useTranslation();
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addIngredient = () => {
    if (ingredient.trim()) { setIngredients([...ingredients, ingredient.trim()]); setIngredient(''); }
  };

  const getSuggestions = async () => {
    if (!ingredients.length) return;
    setLoading(true);
    try {
      const lang = await AsyncStorage.getItem('app_language') || 'en';
      const profileRaw = await AsyncStorage.getItem('family_profile');
      const res = await leftoverAPI.getSuggestions({ ingredients, language: lang, profile: profileRaw ? JSON.parse(profileRaw) : null });
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestions([
        { name: 'Vegetable Khichdi', nameLocal: 'सब्जी खिचड़ी', desc: 'Comforting one-pot rice and lentil dish', time: '20 min' },
        { name: 'Quick Stir Fry', nameLocal: 'स्टर फ्राई', desc: 'Fast stir fry with available veggies and spices', time: '15 min' },
        { name: 'Mixed Veg Paratha', nameLocal: 'मिक्स वेज पराठा', desc: 'Stuffed flatbread with leftover vegetables', time: '25 min' },
      ]);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← {t('common.back', 'Back')}</Text></TouchableOpacity>
          <Text style={styles.title}>{t('leftover.title', 'Use Leftovers')}</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.label}>{t('leftover.whatHaveYou', "What's in your fridge?")}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input} value={ingredient} onChangeText={setIngredient}
            placeholder={t('leftover.addIngredient', 'e.g. spinach, dal, potato...')}
            onSubmitEditing={addIngredient} returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {ingredients.length > 0 && (
          <View style={styles.tags}>
            {ingredients.map((ing, i) => (
              <TouchableOpacity key={i} style={styles.tag} onPress={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}>
                <Text style={styles.tagText}>{ing} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {ingredients.length > 0 && (
          <TouchableOpacity style={styles.suggestBtn} onPress={getSuggestions} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.suggestBtnText}>✨ {t('leftover.getSuggestions', 'Get Suggestions')}</Text>}
          </TouchableOpacity>
        )}
        {suggestions.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>{t('leftover.suggestions', 'Recipe Suggestions')}</Text>
            {suggestions.map((s, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardName}>{s.name}</Text>
                {s.nameLocal && <Text style={styles.cardNameLocal}>{s.nameLocal}</Text>}
                <Text style={styles.cardDesc}>{s.desc}</Text>
                {s.time && <Text style={styles.cardTime}>⏱ {s.time}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  back: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  label: { fontSize: 16, color: COLORS.text.secondary, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#fff', fontSize: 14 },
  suggestBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  suggestBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  results: {},
  resultsTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 12 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary },
  cardNameLocal: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  cardDesc: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4, lineHeight: 20 },
  cardTime: { fontSize: 13, color: COLORS.text.muted, marginTop: 6 },
});
