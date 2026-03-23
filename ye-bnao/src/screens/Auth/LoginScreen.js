import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { sendOTP, verifyOTP } from '../../services/firebaseAuth';
import { useApp } from '../../context/AppContext';
import { initTrial } from '../../utils/subscription';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { setUser } = useApp();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert(t('common.error', 'Error'), t('auth.invalidPhone', 'Please enter a valid 10-digit number'));
      return;
    }
    setLoading(true);
    try {
      const conf = await sendOTP(phone);
      setConfirmation(conf);
      setOtpSent(true);
      Alert.alert(t('auth.otpSent', 'OTP Sent'), `OTP sent to +91-${phone}`);
    } catch (e) {
      Alert.alert(t('common.error', 'Error'), e.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert(t('common.error', 'Error'), t('auth.invalidOTP', 'Please enter the 6-digit OTP'));
      return;
    }
    setLoading(true);
    try {
      const userData = await verifyOTP(confirmation, otp);
      setUser(userData);
      await initTrial();
      const profile = await AsyncStorage.getItem('family_profile');
      navigation.replace(profile ? 'Main' : 'Onboarding');
    } catch (e) {
      Alert.alert(t('common.error', 'Error'), t('auth.wrongOTP', 'Invalid OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.emoji}>👩‍🍳</Text>
          <Text style={styles.title}>Ye Bnao</Text>
          <Text style={styles.subtitle}>{t('auth.login', 'Login to continue')}</Text>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>{t('auth.enterPhone', 'Enter your phone number')}</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit number"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!otpSent}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity style={styles.btn} onPress={handleSendOTP} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{t('auth.sendOTP', 'Send OTP')}</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>{t('auth.enterOTP', 'Enter OTP')}</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit OTP"
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.btn} onPress={handleVerifyOTP} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>{t('auth.verifyOTP', 'Verify OTP')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); setConfirmation(null); }} style={styles.changeBtn}>
                <Text style={styles.changeBtnText}>{t('auth.changeNumber', 'Change Number')}</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.privacyNote}>
            We use your phone number only for login. No spam, ever.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 64 },
  title: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, marginTop: 8 },
  subtitle: { fontSize: 16, color: COLORS.text.secondary, marginTop: 4 },
  form: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 24,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  label: { fontSize: 16, color: COLORS.text.secondary, marginBottom: 8, fontWeight: '500' },
  phoneRow: { flexDirection: 'row', marginBottom: 16 },
  countryCode: {
    backgroundColor: COLORS.background, borderRadius: 8, padding: 12,
    justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  countryCodeText: { fontSize: 16, color: COLORS.text.primary, fontWeight: 'bold' },
  phoneInput: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 8, padding: 12,
    fontSize: 18, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text.primary,
  },
  otpInput: {
    backgroundColor: COLORS.background, borderRadius: 8, padding: 12, fontSize: 24,
    borderWidth: 1, borderColor: COLORS.border, textAlign: 'center',
    letterSpacing: 8, marginBottom: 16, color: COLORS.text.primary,
  },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  changeBtn: { alignItems: 'center', marginTop: 12 },
  changeBtnText: { color: COLORS.primary, fontSize: 14 },
  privacyNote: { textAlign: 'center', marginTop: 16, fontSize: 12, color: COLORS.text.muted },
});
