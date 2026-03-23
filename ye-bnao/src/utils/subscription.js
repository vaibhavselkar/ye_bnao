import AsyncStorage from '@react-native-async-storage/async-storage';

export const PLANS = {
  monthly: { label: '₹30/month', price: 30, duration: 30, key: 'monthly' },
  yearly:  { label: '₹300/year', price: 300, duration: 365, key: 'yearly' },
};

const TRIAL_DAYS = 15;

/** Called once on first login — sets trial_start_date if not already set */
export async function initTrial() {
  const existing = await AsyncStorage.getItem('trial_start_date');
  if (!existing) {
    await AsyncStorage.setItem('trial_start_date', new Date().toISOString());
  }
}

/** Returns number of trial days remaining (0 if expired) */
export async function getTrialDaysLeft() {
  const start = await AsyncStorage.getItem('trial_start_date');
  if (!start) return TRIAL_DAYS; // not started yet
  const elapsed = (Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
}

/** Returns the active subscription object or null */
export async function getSubscription() {
  const raw = await AsyncStorage.getItem('subscription');
  if (!raw) return null;
  const sub = JSON.parse(raw);
  if (new Date(sub.expiry) < new Date()) return null; // expired
  return sub;
}

/**
 * Returns full subscription status object:
 * { hasAccess, isTrialActive, trialDaysLeft, subscription, isExpired }
 */
export async function getSubscriptionStatus() {
  const [trialDaysLeft, subscription] = await Promise.all([
    getTrialDaysLeft(),
    getSubscription(),
  ]);
  const isTrialActive = trialDaysLeft > 0;
  const isSubscribed = !!subscription;
  const hasAccess = isTrialActive || isSubscribed;
  return { hasAccess, isTrialActive, trialDaysLeft, subscription, isExpired: !hasAccess };
}

/**
 * Save a subscription after payment.
 * In production this should be verified server-side.
 */
export async function activateSubscription(plan) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + PLANS[plan].duration);
  const sub = { plan, activatedAt: new Date().toISOString(), expiry: expiry.toISOString() };
  await AsyncStorage.setItem('subscription', JSON.stringify(sub));
  return sub;
}
