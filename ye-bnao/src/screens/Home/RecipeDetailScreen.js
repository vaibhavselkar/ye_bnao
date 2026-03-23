import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';

export default function RecipeDetailScreen({ navigation, route }) {
  const { meal, type } = route.params || {};
  const { t } = useTranslation();
  if (!meal) return <SafeAreaView style={styles.container}><Text style={{ padding: 20 }}>No recipe data</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('common.back', 'Back')}</Text>
          </TouchableOpacity>
          <Text style={styles.mealType}>{type}</Text>
        </View>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text style={styles.recipeName}>{meal.name}</Text>
          <Text style={styles.recipeNameLocal}>{meal.nameLocal}</Text>
          <Text style={styles.recipeDesc}>{meal.desc}</Text>
        </View>
        <View style={styles.metaRow}>
          {[{ icon: '⏱', val: meal.time || '30 min', lbl: t('recipe.cookTime', 'Cook Time') }, { icon: '👨‍👩‍👧', val: meal.serves || '4', lbl: t('recipe.servings', 'Serves') }, { icon: '💰', val: meal.cost || '₹60', lbl: 'Cost' }].map((m, i) => (
            <View key={i} style={styles.metaCard}>
              <Text style={styles.metaIcon}>{m.icon}</Text>
              <Text style={styles.metaVal}>{m.val}</Text>
              <Text style={styles.metaLbl}>{m.lbl}</Text>
            </View>
          ))}
        </View>
        {meal.ingredients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛒 {t('recipe.ingredients', 'Ingredients')}</Text>
            {meal.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingRow}><Text style={styles.ingDot}>•</Text><Text style={styles.ingText}>{ing}</Text></View>
            ))}
          </View>
        )}
        {meal.steps?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍🍳 {t('recipe.instructions', 'Steps')}</Text>
            {meal.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
        {meal.healthNote && (
          <View style={styles.healthNote}>
            <Text style={styles.healthNoteText}>💚 {meal.healthNote}</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  mealType: { fontSize: 13, color: COLORS.text.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  hero: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  heroEmoji: { fontSize: 80, marginBottom: 12 },
  recipeName: { fontSize: 28, fontWeight: 'bold', color: COLORS.text.primary, textAlign: 'center' },
  recipeNameLocal: { fontSize: 22, color: COLORS.primary, marginTop: 4, textAlign: 'center' },
  recipeDesc: { fontSize: 15, color: COLORS.text.secondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  metaRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16 },
  metaCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  metaIcon: { fontSize: 22 },
  metaVal: { fontSize: 15, fontWeight: 'bold', color: COLORS.text.primary, marginTop: 4 },
  metaLbl: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  section: { backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 12 },
  ingRow: { flexDirection: 'row', marginBottom: 6 },
  ingDot: { fontSize: 16, color: COLORS.primary, marginRight: 8 },
  ingText: { fontSize: 15, color: COLORS.text.primary, flex: 1 },
  stepRow: { flexDirection: 'row', marginBottom: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  stepNumText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  stepText: { flex: 1, fontSize: 15, color: COLORS.text.primary, lineHeight: 22 },
  healthNote: { marginHorizontal: 16, backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.sabzi.green },
  healthNoteText: { fontSize: 14, color: '#1B5E20' },
});
