import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { PLANS, activateSubscription, getSubscriptionStatus } from '../../utils/subscription';

export default function SubscriptionScreen({ navigation, route }) {
  const isExpired = route?.params?.isExpired ?? false;
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSubscriptionStatus().then(setStatus);
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // TODO: Integrate Razorpay here
      // For now: simulate payment success
      // In production: open Razorpay → verify on backend → then call activateSubscription
      Alert.alert(
        'Payment Gateway',
        `This will charge ₹${PLANS[selected].price} via Razorpay.\n\nRazorpay integration coming soon.\nFor now, activating your plan directly.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
          {
            text: 'Activate', onPress: async () => {
              await activateSubscription(selected);
              setLoading(false);
              Alert.alert('Subscribed!', `Your ${selected} plan is active.`, [
                { text: 'OK', onPress: () => navigation.replace('Main') },
              ]);
            },
          },
        ]
      );
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSkip = () => {
    if (status?.isTrialActive) {
      navigation.replace('Main');
    } else {
      Alert.alert(
        'Trial Ended',
        'Your 15-day free trial has ended. Please subscribe to continue using Ye Bnao.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👩‍🍳</Text>
          <Text style={styles.title}>Ye Bnao Premium</Text>
          {isExpired ? (
            <Text style={styles.subtitle}>Your free trial has ended.{'\n'}Subscribe to keep cooking smarter.</Text>
          ) : status?.isTrialActive ? (
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>🎉 {status.trialDaysLeft} days left in your free trial</Text>
            </View>
          ) : null}
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            '🍛 Unlimited AI meal plans daily',
            '🥬 Full Sabzi Guide with 28 states',
            '🛒 Smart grocery lists',
            '📈 Local food trends',
            '🫀 Health-condition meal adjustments',
            '📋 15-day recipe history',
            '🎉 Festival & fasting meal plans',
          ].map((f, i) => (
            <Text key={i} style={styles.feature}>{f}</Text>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.plans}>
          <TouchableOpacity
            style={[styles.plan, selected === 'yearly' && styles.planSelected]}
            onPress={() => setSelected('yearly')}
          >
            <View style={styles.planLeft}>
              <Text style={[styles.planName, selected === 'yearly' && styles.planNameSelected]}>Yearly</Text>
              <Text style={styles.planSaving}>Save 17% · Best value</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={[styles.planPrice, selected === 'yearly' && styles.planPriceSelected]}>₹300</Text>
              <Text style={styles.planPer}>/year</Text>
            </View>
            {selected === 'yearly' && <View style={styles.planBadge}><Text style={styles.planBadgeText}>POPULAR</Text></View>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.plan, selected === 'monthly' && styles.planSelected]}
            onPress={() => setSelected('monthly')}
          >
            <View style={styles.planLeft}>
              <Text style={[styles.planName, selected === 'monthly' && styles.planNameSelected]}>Monthly</Text>
              <Text style={styles.planSaving}>Flexible, cancel anytime</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={[styles.planPrice, selected === 'monthly' && styles.planPriceSelected]}>₹30</Text>
              <Text style={styles.planPer}>/month</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.subscribeBtnText}>
                Subscribe · {selected === 'yearly' ? '₹300/year' : '₹30/month'}
              </Text>
          }
        </TouchableOpacity>

        {status?.isTrialActive && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Continue with free trial →</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.disclaimer}>
          Secure payment via Razorpay · Cancel anytime · Auto-renews unless cancelled
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 52, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 15, color: COLORS.text.secondary, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  trialBadge: { marginTop: 8, backgroundColor: '#FFF0EE', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary },
  trialText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  features: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  feature: { fontSize: 14, color: COLORS.text.secondary, paddingVertical: 4, lineHeight: 20 },
  plans: { gap: 10, marginBottom: 20 },
  plan: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 2, borderColor: COLORS.border },
  planSelected: { borderColor: COLORS.primary, backgroundColor: '#FFF9F8' },
  planLeft: { flex: 1 },
  planName: { fontSize: 17, fontWeight: 'bold', color: COLORS.text.primary },
  planNameSelected: { color: COLORS.primary },
  planSaving: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  planRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  planPrice: { fontSize: 22, fontWeight: 'bold', color: COLORS.text.primary },
  planPriceSelected: { color: COLORS.primary },
  planPer: { fontSize: 13, color: COLORS.text.muted },
  planBadge: { position: 'absolute', top: -1, right: 12, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  planBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  subscribeBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  subscribeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  disclaimer: { textAlign: 'center', fontSize: 11, color: COLORS.text.muted, marginTop: 8, lineHeight: 16 },
});
