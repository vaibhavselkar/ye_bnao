import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://ye-bnao-backend.vercel.app';

/**
 * Send OTP via Fast2SMS through our backend.
 * Returns a signed token to pass into verifyOTP.
 */
export async function sendOTP(phone, email) {
  const res = await fetch(`${API_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return { token: data.token, isExisting: data.isExisting || false };
}

/**
 * Verify OTP — backend checks the code, creates/gets Firebase user,
 * returns a custom token which we use to sign into Firebase.
 */
export async function verifyOTP(token, otp) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');

  // Sign into Firebase with the custom token
  const credential = await auth().signInWithCustomToken(data.customToken);
  const user = credential.user;

  const idToken = await user.getIdToken();
  await AsyncStorage.setItem('auth_token', idToken);

  const userData = {
    uid: data.uid,
    phone: data.phone,
    createdAt: user.metadata.creationTime,
  };
  await AsyncStorage.setItem('user_data', JSON.stringify(userData));

  // If profile exists in Firestore, restore it to AsyncStorage (survives reinstalls)
  if (data.profile) {
    await AsyncStorage.setItem('family_profile', JSON.stringify(data.profile));
  }

  return { ...userData, profile: data.profile || null };
}

export async function signOut() {
  await auth().signOut();
  await AsyncStorage.multiRemove(['auth_token', 'user_data']);
}

export function onAuthStateChanged(callback) {
  return auth().onAuthStateChanged(callback);
}

export function getCurrentUser() {
  return auth().currentUser;
}
