import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { trendsAPI } from '../../services/api';
import { COLORS } from '../../constants/colors';

const DEMO_TRENDS = [
  { name: 'Sabudana Khichdi', nameLocal: 'साबुदाना खिचड़ी', tag: 'Trending in Maharashtra', emoji: '🥣', rank: 1 },
  { name: 'Millets Kheer', nameLocal: 'बाजरे की खीर', tag: 'Health Trend 2026', emoji: '🍚', rank: 2 },
  { name: 'Jowar Roti', nameLocal: 'ज्वार की रोटी', tag: 'Trending Nationally', emoji: '🫓', rank: 3 },
  { name: 'Masala Oats', nameLocal: 'मसाला ओट्स', tag: 'Quick & Healthy', emoji: '🥣', rank: 4 },
  { name: 'Pumpkin Halwa', nameLocal: 'कद्दू का हलवा', tag: 'Seasonal Pick', emoji: '🎃', rank: 5 },
  { name: 'Ragi Dosa', nameLocal: 'रागी डोसा', tag: 'South Indian Trend', emoji: '🥞', rank: 6 },
];

export default function TrendsScreen() {
  const { t } = useTranslation();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTrends(); }, []);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const lang = await AsyncStorage.getItem('app_language') || 'en';
      const profileRaw = await AsyncStorage.getItem('family_profile');
      const res = await trendsAPI.getLocal({ language: lang, profile: profileRaw ? JSON.parse(profileRaw) : null });
      setTrends(res.data.trends || DEMO_TRENDS);
    } catch {
      setTrends(DEMO_TRENDS);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTrends} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>📈 {t('trends.title', 'Food Trends')}</Text>
          <Text style={styles.subtitle}>{t('trends.trendingNow', 'Trending Now')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 {t('trends.localTrends', 'Trending in Your Area')}</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ padding: 30 }} />
          ) : (
            trends.map((trend, i) => (
              <View key={i} style={[styles.trendCard, i === 0 && styles.topTrend]}>
                {i === 0 && <View style={styles.topBadge}><Text style={styles.topBadgeText}>🔥 Top Trend</Text></View>}
                <Text style={styles.emoji}>{trend.emoji}</Text>
                <View style={styles.info}>
                  <Text style={styles.trendName}>{trend.name}</Text>
                  <Text style={styles.trendNameLocal}>{trend.nameLocal}</Text>
                  <Text style={styles.tag}>{trend.tag}</Text>
                </View>
                <Text style={styles.rank}>#{i + 1}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 About Trends</Text>
          <Text style={styles.infoText}>Trends are updated daily using AI and web search to show what's popular in your area and across India.</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, paddingBottom: 14, backgroundColor: COLORS.primary },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { margin: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 14 },
  trendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  topTrend: { borderColor: COLORS.secondary, backgroundColor: '#FFFDE7', borderWidth: 1.5 },
  topBadge: { position: 'absolute', top: -1, left: -1, backgroundColor: COLORS.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderBottomLeftRadius: 0, borderTopRightRadius: 0 },
  topBadgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.text.primary },
  emoji: { fontSize: 34, marginRight: 14 },
  info: { flex: 1 },
  trendName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary },
  trendNameLocal: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  tag: { fontSize: 12, color: COLORS.text.muted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginTop: 6, overflow: 'hidden' },
  rank: { fontSize: 22, fontWeight: 'bold', color: COLORS.secondary },
  infoBox: { marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 6 },
  infoText: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20 },
});
