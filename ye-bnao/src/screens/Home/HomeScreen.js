import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { mealPlanAPI } from '../../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];
const MEAL_ICONS = { breakfast: '☀️', lunch: '🌞', snack: '☕', dinner: '🌙' };
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Evening Snack', dinner: 'Dinner' };

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [weekPlan, setWeekPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [loading, setLoading] = useState(false);
  const [changingMeal, setChangingMeal] = useState(null); // 'breakfast'|'lunch' etc
  const [profile, setProfile] = useState(null);

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [savedProfile, cached] = await AsyncStorage.multiGet(['family_profile', 'week_meal_plan']);
      if (savedProfile[1]) setProfile(JSON.parse(savedProfile[1]));
      if (cached[1]) {
        const { plan, week } = JSON.parse(cached[1]);
        // Check if cached plan is from this week
        const cachedWeek = week;
        const currentWeek = getWeekNumber();
        if (cachedWeek === currentWeek) setWeekPlan(plan);
      }
    } catch {}
  };

  const getWeekNumber = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const generatePlan = async () => {
    if (!profile) {
      Alert.alert('No Profile', 'Please complete your profile first', [
        { text: 'Setup', onPress: () => navigation.navigate('Onboarding') },
      ]);
      return;
    }
    setLoading(true);
    try {
      const lang = await AsyncStorage.getItem('app_language') || 'en';
      const historyRaw = await AsyncStorage.getItem('recipe_history');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const response = await mealPlanAPI.generate({ profile, language: lang, history: history.slice(0, 20) });
      const plan = response.data.weekPlan;
      setWeekPlan(plan);
      await AsyncStorage.setItem('week_meal_plan', JSON.stringify({ plan, week: getWeekNumber() }));
    } catch (err) {
      Alert.alert('Error', 'Could not generate meal plan. Please check your internet and try again.\n\n' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const changeMeal = async (mealType) => {
    if (!profile || !weekPlan) return;
    setChangingMeal(mealType);
    try {
      const lang = await AsyncStorage.getItem('app_language') || 'en';
      const response = await mealPlanAPI.regenerateMeal({
        profile, language: lang, dayIndex: selectedDay, mealType, currentWeekPlan: weekPlan,
      });
      const newMeal = response.data.meal;
      const updatedWeek = { ...weekPlan };
      updatedWeek.week = weekPlan.week.map((d, i) =>
        i === selectedDay ? { ...d, [mealType]: newMeal } : d
      );
      setWeekPlan(updatedWeek);
      await AsyncStorage.setItem('week_meal_plan', JSON.stringify({ plan: updatedWeek, week: getWeekNumber() }));
    } catch {
      Alert.alert('Error', 'Could not change this meal. Try again.');
    } finally {
      setChangingMeal(null);
    }
  };

  const sharePlan = async () => {
    if (!weekPlan?.week?.[selectedDay]) return;
    const day = weekPlan.week[selectedDay];
    const text = `🍽️ ${DAYS[selectedDay]} ka khana:\n\n☀️ Nashta: ${day.breakfast?.name}\n🌞 Dopahar: ${day.lunch?.name}\n☕ Shaam: ${day.snack?.name}\n🌙 Raat: ${day.dinner?.name}\n\n— Ye Bnao App`;
    try { await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`); }
    catch { Alert.alert('WhatsApp not available'); }
  };

  const todayMeals = weekPlan?.week?.[selectedDay];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.userName}>{profile?.name || 'Chef'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>👩‍🍳</Text>
          </TouchableOpacity>
        </View>

        {/* Day selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
          {DAYS.map((day, i) => {
            const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, selectedDay === i && styles.dayChipActive]}
                onPress={() => setSelectedDay(i)}
              >
                <Text style={[styles.dayChipText, selectedDay === i && styles.dayChipTextActive]}>{day}</Text>
                {isToday && <View style={[styles.todayDot, selectedDay === i && styles.todayDotActive]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Generate / Meal Plan */}
        {!weekPlan ? (
          <View style={styles.generateBox}>
            <Text style={styles.generateEmoji}>🍱</Text>
            <Text style={styles.generateTitle}>Weekly Meal Plan</Text>
            <Text style={styles.generateSub}>AI will plan all 7 days based on your family's preferences</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={generatePlan} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>✨ Generate Week Plan</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.planSection}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>📅 {DAYS[selectedDay]}'s Meals</Text>
              <TouchableOpacity onPress={generatePlan} disabled={loading} style={styles.regenBtn}>
                {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.regenBtnText}>🔄 New Week</Text>}
              </TouchableOpacity>
            </View>

            {MEAL_TYPES.map((type) => {
              const meal = todayMeals?.[type];
              const isChanging = changingMeal === type;
              return (
                <View key={type} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealIcon}>{MEAL_ICONS[type]}</Text>
                    <Text style={styles.mealType}>{MEAL_LABELS[type]}</Text>
                    <TouchableOpacity
                      style={styles.changeBtn}
                      onPress={() => changeMeal(type)}
                      disabled={isChanging || !!changingMeal}
                    >
                      {isChanging
                        ? <ActivityIndicator size="small" color={COLORS.primary} />
                        : <Text style={styles.changeBtnText}>🔄 Change</Text>}
                    </TouchableOpacity>
                  </View>
                  {meal ? (
                    <TouchableOpacity onPress={() => navigation.navigate('RecipeDetail', { meal, type })} activeOpacity={0.8}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      {meal.nameEn && meal.nameEn !== meal.name && <Text style={styles.mealNameEn}>{meal.nameEn}</Text>}
                      <Text style={styles.mealDesc} numberOfLines={2}>{meal.desc}</Text>
                      <View style={styles.mealMeta}>
                        <Text style={styles.mealMetaBadge}>⏱ {meal.time}</Text>
                        <Text style={styles.mealMetaBadge}>💰 {meal.cost}</Text>
                        <Text style={styles.mealMetaBadge}>👆 Tap for recipe</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.noMeal}>Loading...</Text>
                  )}
                </View>
              );
            })}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.waBtn} onPress={sharePlan}>
                <Text style={styles.waBtnText}>📱 Share on WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.leftoverBtn} onPress={() => navigation.navigate('Leftover')}>
                <Text style={styles.leftoverBtnText}>🥣 Leftovers</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: '🥬', label: 'Sabzi Guide', screen: 'SabziGuide' },
              { icon: '📅', label: 'Festivals', screen: 'Festival' },
              { icon: '⭐', label: 'Try New', screen: 'Trends' },
              { icon: '💬', label: 'Feedback', screen: 'Feedback' },
            ].map(({ icon, label, screen }) => (
              <TouchableOpacity key={screen} style={styles.quickCard} onPress={() => navigation.navigate(screen)}>
                <Text style={styles.quickIcon}>{icon}</Text>
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  greeting: { fontSize: 13, color: COLORS.text.muted },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.text.primary },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24 },
  dayScroll: { marginBottom: 4 },
  dayScrollContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', minWidth: 52 },
  dayChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayChipText: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  dayChipTextActive: { color: '#fff' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 3 },
  todayDotActive: { backgroundColor: '#fff' },
  generateBox: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  generateEmoji: { fontSize: 52, marginBottom: 12 },
  generateTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  generateSub: { fontSize: 14, color: COLORS.text.muted, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  generateBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  generateBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  planSection: { marginHorizontal: 16 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary },
  regenBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary },
  regenBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  mealCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, elevation: 1 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mealIcon: { fontSize: 18, marginRight: 6 },
  mealType: { flex: 1, fontSize: 11, fontWeight: '700', color: COLORS.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  changeBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, minWidth: 80, alignItems: 'center' },
  changeBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  mealName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary },
  mealNameEn: { fontSize: 13, color: COLORS.text.muted, marginTop: 1 },
  mealDesc: { fontSize: 13, color: COLORS.text.secondary, marginTop: 4, lineHeight: 19 },
  mealMeta: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  mealMetaBadge: { fontSize: 11, color: COLORS.text.muted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  noMeal: { fontSize: 14, color: COLORS.text.muted, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 16 },
  waBtn: { flex: 1, backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  waBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  leftoverBtn: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary },
  leftoverBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  quickSection: { marginHorizontal: 16, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  quickIcon: { fontSize: 28, marginBottom: 6 },
  quickLabel: { fontSize: 11, color: COLORS.text.secondary, fontWeight: '600', textAlign: 'center' },
});
