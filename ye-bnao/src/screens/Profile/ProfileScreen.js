import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { LANGUAGES, RTL_LANGUAGES } from '../../constants/languages';
import { COLORS } from '../../constants/colors';
import { getSubscriptionStatus } from '../../utils/subscription';
import { signOut } from '../../services/firebaseAuth';

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { language, changeLanguage, familyProfile, user, setUser } = useApp();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [subStatus, setSubStatus] = useState(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    getSubscriptionStatus().then(setSubStatus);
  }, []);

  const subLabel = () => {
    if (!subStatus) return '...';
    if (subStatus.subscription) {
      const expiry = new Date(subStatus.subscription.expiry).toLocaleDateString('en-IN');
      return subStatus.subscription.plan === 'yearly' ? `Premium Yearly · till ${expiry}` : `Premium Monthly · till ${expiry}`;
    }
    if (subStatus.isTrialActive) return `Free Trial · ${subStatus.trialDaysLeft} days left`;
    return 'Trial Ended — Subscribe';
  };

  const subValueColor = () => {
    if (!subStatus) return COLORS.text.muted;
    if (subStatus.subscription) return '#27ae60';
    if (subStatus.isTrialActive) return subStatus.trialDaysLeft <= 3 ? '#e67e22' : COLORS.primary;
    return COLORS.error;
  };

  const handleLanguageChange = async (code) => {
    setShowLangPicker(false);
    await changeLanguage(code);
    await i18n.changeLanguage(code);
    if (RTL_LANGUAGES.includes(code)) {
      Alert.alert(t('language.languageChanged', 'Language Updated'), t('language.rtlRestartNote', 'App will restart to apply right-to-left layout.'));
    }
  };

  const handleLogout = () => {
    Alert.alert(t('auth.logout', 'Logout'), 'Are you sure you want to logout?', [
      { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      {
        text: t('auth.logout', 'Logout'), style: 'destructive',
        onPress: async () => {
          await signOut();
          await AsyncStorage.multiRemove(['user_data', 'family_profile', 'today_meal_plan', 'recipe_history']);
          setUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const Row = ({ icon, label, value, valueColor, onPress, right }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !right}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, valueColor && { color: valueColor }]}>{value}</Text>}
        {right}
        {onPress && !right && <Text style={styles.rowArrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarEmoji}>👩‍🍳</Text></View>
          <Text style={styles.profileName}>{familyProfile?.name || user?.phone || 'User'}</Text>
          <Text style={styles.profileSub}>
            {familyProfile && !familyProfile.isDefault
              ? `${familyProfile.city ? familyProfile.city + ', ' : ''}${familyProfile.state || ''}`
              : 'Complete your profile for better recipes'}
          </Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Onboarding')}>
            <Text style={styles.editBtnText}>✏️ {t('profile.editProfile', 'Edit Profile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription banner — show when trial is expiring or expired */}
        {subStatus && !subStatus.subscription && subStatus.trialDaysLeft <= 5 && (
          <TouchableOpacity
            style={[styles.subBanner, subStatus.isExpired && styles.subBannerExpired]}
            onPress={() => navigation.navigate('Subscription', { isExpired: subStatus.isExpired })}
          >
            <Text style={styles.subBannerText}>
              {subStatus.isExpired
                ? '🔒 Your trial ended. Subscribe to continue.'
                : `⏰ ${subStatus.trialDaysLeft} days left in trial — Subscribe now`}
            </Text>
            <Text style={styles.subBannerCta}>View plans →</Text>
          </TouchableOpacity>
        )}

        {/* Family Members */}
        {familyProfile?.members?.length > 0 && !familyProfile.isDefault && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.familyMembers', 'Family Members')}</Text>
            {familyProfile.members.map((m, i) => (
              <View key={i} style={styles.memberRow}>
                <Text style={styles.memberIcon}>{m.diet === 'vegetarian' ? '🥗' : m.diet === 'eggetarian' ? '🥚' : '🍗'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.name || `Member ${i + 1}`}</Text>
                  {m.health?.length > 0 && <Text style={styles.memberHealth}>{m.health.join(', ')}</Text>}
                </View>
                <Text style={styles.memberSpice}>{'🌶'.repeat(m.spice || 3)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings', 'Settings')}</Text>
          <Row
            icon="🌐" label={t('profile.language', 'Language')}
            value={currentLang.nativeName} onPress={() => setShowLangPicker(!showLangPicker)}
          />
          {showLangPicker && (
            <ScrollView style={styles.langPicker} nestedScrollEnabled>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOpt, language === lang.code && styles.langOptActive]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={[styles.langNative, lang.rtl && { textAlign: 'right' }, language === lang.code && styles.langNativeActive]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.langEng}>{lang.name}</Text>
                  {language === lang.code && <Text style={styles.langCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Row
            icon="🔔" label={t('profile.notifications', 'Notifications')}
            right={<Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#fff" />}
          />
          <Row
            icon="⭐" label={t('profile.subscription', 'Subscription')}
            value={subLabel()} valueColor={subValueColor()}
            onPress={() => navigation.navigate('Subscription', { isExpired: subStatus?.isExpired })}
          />
          <Row icon="📖" label={t('recipe.history', 'Recipe History')} onPress={() => navigation.navigate('RecipeHistory')} />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Row icon="❓" label={t('profile.helpSupport', 'Help & Support')} onPress={() => {}} />
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 {t('auth.logout', 'Logout')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appVersion}>
          <Text style={styles.versionText}>Ye Bnao v1.0.0 • Made with ❤️ for Indian Families</Text>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeader: { alignItems: 'center', padding: 24, paddingBottom: 20, backgroundColor: COLORS.primary },
  avatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 46 },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  profileSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'center' },
  editBtn: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  editBtnText: { color: '#fff', fontSize: 14 },
  subBanner: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFF3CD', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FFD700', flexDirection: 'row', alignItems: 'center' },
  subBannerExpired: { backgroundColor: '#FDECEA', borderColor: COLORS.error },
  subBannerText: { flex: 1, fontSize: 13, color: '#856404' },
  subBannerCta: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginLeft: 8 },
  section: { marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.surface, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: COLORS.text.muted, padding: 14, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  rowIcon: { fontSize: 20, marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 16, color: COLORS.text.primary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, color: COLORS.text.muted, maxWidth: 180, textAlign: 'right' },
  rowArrow: { fontSize: 22, color: COLORS.border },
  langPicker: { maxHeight: 260, borderTopWidth: 1, borderTopColor: COLORS.border },
  langOpt: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  langOptActive: { backgroundColor: '#FFF0EE' },
  langNative: { fontSize: 18, fontWeight: '600', color: COLORS.text.primary, flex: 1 },
  langNativeActive: { color: COLORS.primary },
  langEng: { fontSize: 12, color: COLORS.text.muted, marginLeft: 8 },
  langCheck: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  memberIcon: { fontSize: 22, marginRight: 10 },
  memberName: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  memberHealth: { fontSize: 12, color: COLORS.error, marginTop: 2 },
  memberSpice: { fontSize: 12 },
  logoutRow: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border },
  logoutText: { fontSize: 16, color: COLORS.error, fontWeight: '700' },
  appVersion: { alignItems: 'center', padding: 20, marginTop: 8 },
  versionText: { fontSize: 12, color: COLORS.text.muted },
});
