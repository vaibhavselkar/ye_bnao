import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl, ActivityIndicator, Alert, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { mealPlanAPI } from '../../services/api';

const DEMO_PLAN = {
  breakfast: { name: 'Poha', nameLocal: 'पोहा', desc: 'Flattened rice with mustard seeds, onion & peas', time: '15 min', cost: '₹30', ingredients: ['1 cup poha', '1 onion', 'green peas', 'mustard seeds', 'curry leaves', 'turmeric', 'salt', 'lemon juice'], steps: ['Rinse poha and drain', 'Heat oil, add mustard seeds', 'Add onion and peas, sauté', 'Add poha and spices', 'Mix well, garnish with lemon and coriander'] },
  lunch: { name: 'Dal Tadka & Rice', nameLocal: 'दाल तड़का और चावल', desc: 'Yellow lentils with basmati rice', time: '30 min', cost: '₹60', ingredients: ['1 cup toor dal', '2 cups rice', 'tomato', 'onion', 'ghee', 'cumin', 'garlic', 'red chilli'], steps: ['Pressure cook dal and rice separately', 'Make tadka with ghee, cumin, garlic', 'Add tomato and spices', 'Pour over cooked dal', 'Serve hot with rice'] },
  snack: { name: 'Masala Chai & Biscuits', nameLocal: 'मसाला चाय', desc: 'Spiced tea with milk and cardamom', time: '10 min', cost: '₹20', ingredients: ['tea leaves', 'milk', 'sugar', 'cardamom', 'ginger'], steps: ['Boil water with ginger', 'Add tea leaves and spices', 'Add milk and sugar', 'Simmer for 2 minutes', 'Strain and serve'] },
  dinner: { name: 'Roti & Aloo Sabzi', nameLocal: 'रोटी और आलू सब्ज़ी', desc: 'Whole wheat flatbread with spiced potato curry', time: '25 min', cost: '₹50', ingredients: ['2 cups wheat flour', '3 potatoes', 'onion', 'tomato', 'spices'], steps: ['Knead dough and rest 20 min', 'Boil and cube potatoes', 'Make sabzi with onion-tomato base', 'Roll and cook rotis on tawa', 'Serve hot together'] },
};

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);

  const hours = new Date().getHours();
  const greeting = hours < 12 ? t('home.goodMorning', 'Good Morning') : hours < 17 ? t('home.goodAfternoon', 'Good Afternoon') : t('home.goodEvening', 'Good Evening');
  const dayOfWeek = new Date().getDay();
  const showWeekendBanner = dayOfWeek >= 5 || dayOfWeek === 0;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [savedProfile, cached] = await AsyncStorage.multiGet(['family_profile', 'today_meal_plan']);
      if (savedProfile[1]) setProfile(JSON.parse(savedProfile[1]));
      if (cached[1]) {
        const { plan, date } = JSON.parse(cached[1]);
        if (date === new Date().toDateString()) setMealPlan(plan);
      }
    } catch {}
  };

  const generatePlan = async () => {
    if (!profile) {
      Alert.alert('No Profile', 'Please complete your profile first', [{ text: 'Setup', onPress: () => navigation.navigate('Onboarding') }]);
      return;
    }
    setLoading(true);
    try {
      const lang = await AsyncStorage.getItem('app_language') || 'en';
      const historyRaw = await AsyncStorage.getItem('recipe_history');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const response = await mealPlanAPI.generate({ profile, language: lang, date: new Date().toISOString(), history: history.slice(0, 20) });
      const plan = response.data.mealPlan;
      setMealPlan(plan);
      await AsyncStorage.setItem('today_meal_plan', JSON.stringify({ plan, date: new Date().toDateString() }));
    } catch {
      setMealPlan(DEMO_PLAN);
      await AsyncStorage.setItem('today_meal_plan', JSON.stringify({ plan: DEMO_PLAN, date: new Date().toDateString() }));
    } finally {
      setLoading(false);
    }
  };

  const sharePlan = async () => {
    if (!mealPlan) return;
    const text = `🍽️ Aaj ka khana:\n\n☀️ Nashta: ${mealPlan.breakfast?.name}\n🌞 Dopahar: ${mealPlan.lunch?.name}\n☕ Shaam: ${mealPlan.snack?.name}\n🌙 Raat: ${mealPlan.dinner?.name}\n\n— Ye Bnao App`;
    try { await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`); }
    catch { Alert.alert('WhatsApp not available on this device'); }
  };

  const MealCard = ({ type, meal, icon }) => (
    <TouchableOpacity style={styles.mealCard} onPress={() => meal && navigation.navigate('RecipeDetail', { meal, type })} activeOpacity={0.85}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealIcon}>{icon}</Text>
        <Text style={styles.mealType}>{type}</Text>
        <Text style={styles.mealArrow}>›</Text>
      </View>
      {meal ? (
        <>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealNameLocal}>{meal.nameLocal}</Text>
          <Text style={styles.mealDesc} numberOfLines={2}>{meal.desc}</Text>
          <View style={styles.mealMeta}>
            <Text style={styles.mealMetaBadge}>⏱ {meal.time}</Text>
            <Text style={styles.mealMetaBadge}>💰 {meal.cost}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.noMeal}>Generate meal plan to see suggestions</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await generatePlan(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Date */}
        <View style={styles.dateBanner}>
          <Text style={styles.dateText}>📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        {/* Weekend Sabzi Banner */}
        {showWeekendBanner && (
          <TouchableOpacity style={styles.weekendBanner} onPress={() => navigation.navigate('SabziGuide')} activeOpacity={0.85}>
            <Text style={styles.wbEmoji}>🥬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.wbTitle}>{t('home.weekendSabziList', 'Weekend Sabzi List')} 🛒</Text>
              <Text style={styles.wbSub}>See what to buy this weekend →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Generate / Meal Plan */}
        {!mealPlan ? (
          <View style={styles.generateBox}>
            <Text style={styles.generateTitle}>{t('home.todaysMealPlan', "Today's Meal Plan")}</Text>
            <Text style={styles.generateSub}>Let AI plan your meals based on your family's preferences</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={generatePlan} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>✨ {t('home.generatePlan', 'Generate Meal Plan')}</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.planSection}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{t('home.todaysMealPlan', "Today's Meal Plan")}</Text>
              <TouchableOpacity onPress={generatePlan} disabled={loading}>
                <Text style={styles.regenBtn}>{loading ? '...' : '🔄 ' + t('home.regenerate', 'Redo')}</Text>
              </TouchableOpacity>
            </View>
            <MealCard type={t('home.breakfast', 'Breakfast')} meal={mealPlan.breakfast} icon="☀️" />
            <MealCard type={t('home.lunch', 'Lunch')} meal={mealPlan.lunch} icon="🌞" />
            <MealCard type={t('home.eveningSnack', 'Evening Snack')} meal={mealPlan.snack} icon="☕" />
            <MealCard type={t('home.dinner', 'Dinner')} meal={mealPlan.dinner} icon="🌙" />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.waBtn} onPress={sharePlan}>
                <Text style={styles.waBtnText}>📱 Share on WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.leftoverBtn} onPress={() => navigation.navigate('Leftover')}>
                <Text style={styles.leftoverBtnText}>🥣 {t('home.leftovers', 'Leftovers')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: '📅', label: t('festival.title', 'Festivals'), screen: 'Festival' },
              { icon: '📖', label: t('recipe.history', 'History'), screen: 'RecipeHistory' },
              { icon: '⭐', label: t('home.tryNewRecipe', 'Try New'), screen: 'Trends' },
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
  dateBanner: { marginHorizontal: 16, backgroundColor: COLORS.secondary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 12 },
  dateText: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  weekendBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#E8F5E9', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.sabzi.green },
  wbEmoji: { fontSize: 34, marginRight: 12 },
  wbTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },
  wbSub: { fontSize: 12, color: '#388E3C', marginTop: 2 },
  generateBox: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  generateTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  generateSub: { fontSize: 14, color: COLORS.text.muted, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  generateBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  generateBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  planSection: { marginHorizontal: 16 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  planTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  regenBtn: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  mealCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mealIcon: { fontSize: 20, marginRight: 8 },
  mealType: { flex: 1, fontSize: 11, fontWeight: '700', color: COLORS.text.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  mealArrow: { fontSize: 20, color: COLORS.border },
  mealName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary },
  mealNameLocal: { fontSize: 15, color: COLORS.primary, marginTop: 1 },
  mealDesc: { fontSize: 13, color: COLORS.text.secondary, marginTop: 4, lineHeight: 19 },
  mealMeta: { flexDirection: 'row', gap: 8, marginTop: 8 },
  mealMetaBadge: { fontSize: 12, color: COLORS.text.muted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  noMeal: { fontSize: 14, color: COLORS.text.muted, fontStyle: 'italic', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 16 },
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
