import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';

const FESTIVALS = [
  { date: '2026-03-25', name: 'Holi', fast: false, emoji: '🎨' },
  { date: '2026-04-02', name: 'Ram Navami', fast: true, emoji: '🙏' },
  { date: '2026-04-14', name: 'Baisakhi', fast: false, emoji: '🌾' },
  { date: '2026-08-20', name: 'Janmashtami', fast: true, emoji: '🦚' },
  { date: '2026-09-09', name: 'Ganesh Chaturthi', fast: false, emoji: '🐘' },
  { date: '2026-10-03', name: 'Navratri Begins', fast: true, emoji: '🪔' },
  { date: '2026-10-28', name: 'Diwali', fast: false, emoji: '✨' },
  { date: '2026-11-13', name: 'Chhath Puja', fast: true, emoji: '🌅' },
  { date: '2026-12-25', name: 'Christmas', fast: false, emoji: '🎄' },
  { date: '2027-01-14', name: 'Makar Sankranti', fast: false, emoji: '🪁' },
];

export default function FestivalScreen({ navigation }) {
  const { t } = useTranslation();
  const today = new Date();

  const upcoming = FESTIVALS.filter(f => new Date(f.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getDaysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - today) / 86400000);
    if (diff === 0) return t('festival.today', 'Today');
    if (diff === 1) return t('festival.tomorrow', 'Tomorrow');
    return `In ${diff} days`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← {t('common.back', 'Back')}</Text></TouchableOpacity>
          <Text style={styles.title}>{t('festival.title', 'Festivals & Fasting')}</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.subtitle}>{t('festival.upcomingFestivals', 'Upcoming Festivals')}</Text>
        {upcoming.map((f, i) => (
          <View key={i} style={[styles.card, f.fast && styles.fastCard]}>
            <Text style={styles.emoji}>{f.emoji}</Text>
            <View style={styles.info}>
              <Text style={styles.festName}>{f.name}</Text>
              <Text style={styles.festDate}>{new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              {f.fast && <Text style={styles.fastBadge}>🕐 Fasting Day</Text>}
            </View>
            <Text style={[styles.daysUntil, getDaysUntil(f.date) === t('festival.today', 'Today') && styles.today]}>
              {getDaysUntil(f.date)}
            </Text>
          </View>
        ))}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 The app automatically adjusts your meal plan on festival and fasting days based on your region and diet preferences.</Text>
        </View>
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
  subtitle: { fontSize: 15, color: COLORS.text.muted, marginBottom: 14, fontWeight: '500' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  fastCard: { borderColor: COLORS.secondary, backgroundColor: '#FFFDE7' },
  emoji: { fontSize: 34, marginRight: 14 },
  info: { flex: 1 },
  festName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text.primary },
  festDate: { fontSize: 13, color: COLORS.text.muted, marginTop: 2 },
  fastBadge: { fontSize: 12, color: COLORS.warning, marginTop: 4 },
  daysUntil: { fontSize: 12, color: COLORS.text.muted, fontWeight: '700', textAlign: 'right' },
  today: { color: COLORS.success },
  infoBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: COLORS.secondary },
  infoText: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20 },
});
