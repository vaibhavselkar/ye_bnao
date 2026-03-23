import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { sabziAPI } from '../../services/api';
import { COLORS } from '../../constants/colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEMO_VEGS = [
  { name: 'Spinach', nameLocal: 'पालक', status: 'in-season', price: '₹40/kg', storage: 'Refrigerate in a bag. Use within 3-5 days.', health: 'Excellent for anaemia. Rich in iron and folate.', dishes: ['Palak Paneer', 'Palak Dal', 'Palak Paratha'] },
  { name: 'Cauliflower', nameLocal: 'फूलगोभी', status: 'in-season', price: '₹35/kg', storage: 'Store in fridge, use within a week.', health: 'Avoid raw form for hypothyroidism; cooked is fine.', dishes: ['Aloo Gobi', 'Gobhi Paratha', 'Gobi Manchurian'] },
  { name: 'Bottle Gourd', nameLocal: 'लौकी', status: 'in-season', price: '₹25/kg', storage: 'Room temperature for 2-3 days.', health: 'Cooling vegetable, great for kidney health and digestion.', dishes: ['Lauki Ki Sabzi', 'Lauki Chana Dal', 'Lauki Halwa'] },
  { name: 'Tomato', nameLocal: 'टमाटर', status: 'ending-soon', price: '₹60/kg', storage: 'Keep at room temperature away from sunlight.', health: 'Rich in lycopene. Use in moderation for kidney disease.', dishes: ['Tomato Rasam', 'Tomato Dal', 'Tomato Chutney'] },
  { name: 'Green Peas', nameLocal: 'हरी मटर', status: 'coming-soon', price: '₹80/kg', storage: 'Shell and freeze for extended use.', health: 'High protein, good for diabetics.', dishes: ['Matar Paneer', 'Matar Pulao', 'Aloo Matar'] },
  { name: 'Fenugreek', nameLocal: 'मेथी', status: 'in-season', price: '₹30/kg', storage: 'Refrigerate in an airtight bag.', health: 'Controls blood sugar. Excellent for diabetes management.', dishes: ['Methi Paratha', 'Methi Dal', 'Methi Aloo'] },
];

const BADGE_CONFIG = {
  'in-season': { label: 'In Season', color: COLORS.sabzi.green, bg: '#E8F5E9' },
  'ending-soon': { label: 'Ending Soon', color: COLORS.sabzi.amber, bg: '#FFF8E1' },
  'coming-soon': { label: 'Coming Soon', color: COLORS.sabzi.blue, bg: '#E3F2FD' },
};

export default function SabziGuideScreen() {
  const { t } = useTranslation();
  const [vegetables, setVegetables] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const currentMonth = new Date().getMonth();

  useEffect(() => { loadVegetables(); }, []);

  const loadVegetables = async () => {
    setLoading(true);
    try {
      const cachedRaw = await AsyncStorage.getItem('sabzi_guide');
      if (cachedRaw) {
        const { vegetables: v, tips: tip, date } = JSON.parse(cachedRaw);
        if (date === new Date().toDateString()) { setVegetables(v || []); setTips(tip || []); setLoading(false); return; }
      }
      const lang = await AsyncStorage.getItem('app_language') || 'en';
      const profileRaw = await AsyncStorage.getItem('family_profile');
      const res = await sabziAPI.getSeasonal({ language: lang, profile: profileRaw ? JSON.parse(profileRaw) : null });
      const vegs = res.data.vegetables || DEMO_VEGS;
      const tipList = res.data.tips || [];
      setVegetables(vegs); setTips(tipList);
      await AsyncStorage.setItem('sabzi_guide', JSON.stringify({ vegetables: vegs, tips: tipList, date: new Date().toDateString() }));
    } catch {
      setVegetables(DEMO_VEGS);
      setTips(['Buy seasonal vegetables for best nutrition and value.', 'Check your local mandi for the freshest produce.', 'Plan your week\'s meals around what\'s in season.']);
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? vegetables : vegetables.filter(v => v.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={async () => { await AsyncStorage.removeItem('sabzi_guide'); await loadVegetables(); }} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🥬 {t('sabziGuide.title', 'Sabzi Guide')}</Text>
          <Text style={styles.subtitle}>Seasonal vegetables for your region</Text>
        </View>

        {/* Monthly Calendar Strip */}
        <View style={styles.calSection}>
          <Text style={styles.sectionLabel}>📅 {t('sabziGuide.seasonalCalendar', 'Seasonal Calendar')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.monthStrip}>
              {MONTHS.map((m, i) => (
                <View key={i} style={[styles.monthItem, i === currentMonth && styles.monthItemActive]}>
                  <Text style={[styles.monthText, i === currentMonth && styles.monthTextActive]}>{m}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'in-season', label: '🟢 Season' },
            { key: 'ending-soon', label: '🟡 Ending' },
            { key: 'coming-soon', label: '🔵 Coming' },
          ].map(f => (
            <TouchableOpacity key={f.key} style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]} onPress={() => setFilter(f.key)}>
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vegetables */}
        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.sabzi.green} /><Text style={styles.loadingText}>{t('sabziGuide.loadingVegetables', 'Loading seasonal vegetables...')}</Text></View>
        ) : (
          <View style={styles.vegList}>
            {filtered.map((veg, i) => {
              const badge = BADGE_CONFIG[veg.status] || BADGE_CONFIG['in-season'];
              return (
                <View key={i} style={styles.vegCard}>
                  <View style={styles.vegHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vegName}>{veg.name}</Text>
                      <Text style={styles.vegNameLocal}>{veg.nameLocal}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.price}>💰 {veg.price} <Text style={styles.priceNote}>({t('common.priceDisclaimer', 'approx.')})</Text></Text>
                  {veg.storage && <Text style={styles.storage}>📦 {veg.storage}</Text>}
                  {veg.health && <Text style={styles.health}>💚 {veg.health}</Text>}
                  {veg.dishes?.length > 0 && (
                    <View style={styles.dishRow}>
                      {veg.dishes.slice(0, 3).map((d, j) => <Text key={j} style={styles.dishChip}>{d}</Text>)}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Seasonal Tips */}
        {tips.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionLabel}>🌿 {t('sabziGuide.weeklyTips', 'Weekly Seasonal Tips')}</Text>
            {tips.map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipNum}>{i + 1}</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, paddingBottom: 12, backgroundColor: '#E8F5E9', borderBottomWidth: 1, borderBottomColor: '#C8E6C9' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1B5E20' },
  subtitle: { fontSize: 13, color: '#388E3C', marginTop: 2 },
  calSection: { margin: 16, marginBottom: 8 },
  sectionLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 10 },
  monthStrip: { flexDirection: 'row', gap: 6 },
  monthItem: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  monthItemActive: { backgroundColor: COLORS.sabzi.green, borderColor: COLORS.sabzi.green },
  monthText: { fontSize: 13, color: COLORS.text.muted, fontWeight: '500' },
  monthTextActive: { color: '#fff', fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.sabzi.green, borderColor: COLORS.sabzi.green },
  filterText: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  loading: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 14, color: COLORS.text.muted, marginTop: 12 },
  vegList: { paddingHorizontal: 16 },
  vegCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  vegHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  vegName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary },
  vegNameLocal: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  price: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 4 },
  priceNote: { fontSize: 11, color: COLORS.text.muted, fontStyle: 'italic' },
  storage: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 4 },
  health: { fontSize: 13, color: '#2E7D32', marginBottom: 8 },
  dishRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dishChip: { fontSize: 12, backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, color: COLORS.text.secondary, borderWidth: 1, borderColor: COLORS.border },
  tipsSection: { marginHorizontal: 16, marginTop: 4 },
  tipCard: { flexDirection: 'row', backgroundColor: '#F1F8E9', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#DCEDC8' },
  tipNum: { fontSize: 16, fontWeight: 'bold', color: COLORS.sabzi.green, marginRight: 10, minWidth: 20 },
  tipText: { flex: 1, fontSize: 14, color: '#33691E', lineHeight: 20 },
});
