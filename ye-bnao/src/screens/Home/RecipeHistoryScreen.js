import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';

export default function RecipeHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const { t } = useTranslation();

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem('recipe_history');
      if (raw) {
        const all = JSON.parse(raw);
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 15);
        setHistory(all.filter(r => new Date(r.date) > cutoff));
      }
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← {t('common.back', 'Back')}</Text></TouchableOpacity>
        <Text style={styles.title}>{t('recipe.history', 'Recipe History')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <Text style={styles.subtitle}>{t('recipe.last15Days', 'Last 15 Days')}</Text>
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyText}>{t('recipe.noHistory', 'No recipe history yet')}</Text>
          <Text style={styles.emptyHint}>Rate meals after cooking to build your history</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.mealTypeBadge}>{item.type}</Text>
              </View>
              {item.nameLocal && <Text style={styles.nameLocal}>{item.nameLocal}</Text>}
              <View style={styles.metaRow}>
                <Text style={styles.date}>📅 {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                {item.rating && <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  back: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  subtitle: { fontSize: 13, color: COLORS.text.muted, paddingHorizontal: 16, marginBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, color: COLORS.text.secondary, fontWeight: '600' },
  emptyHint: { fontSize: 14, color: COLORS.text.muted, marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dishName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary, flex: 1 },
  nameLocal: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  mealTypeBadge: { fontSize: 11, color: COLORS.text.muted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  date: { fontSize: 13, color: COLORS.text.muted },
  rating: { fontSize: 14 },
});
