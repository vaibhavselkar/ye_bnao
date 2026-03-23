import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Send OTP to +91<phone>.
 * Returns the confirmation object to pass into verifyOTP.
 */
export async function sendOTP(phone) {
  const fullNumber = `+91${phone}`;
  const confirmation = await auth().signInWithPhoneNumber(fullNumber);
  return confirmation;
}

/**
 * Verify the 6-digit code from the user.
 * Saves auth_token + user_data to AsyncStorage on success.
 * Returns the Firebase User object.
 */
export async function verifyOTP(confirmation, code) {
  const credential = await confirmation.confirm(code);
  const user = credential.user;

  // Persist token so api.js interceptor can attach it to requests
  const token = await user.getIdToken();
  await AsyncStorage.setItem('auth_token', token);

  const userData = {
    uid: user.uid,
    phone: user.phoneNumber,
    createdAt: user.metadata.creationTime,
  };
  await AsyncStorage.setItem('user_data', JSON.stringify(userData));

  return userData;
}

/**
 * Sign out the current user and clear local storage keys.
 */
export async function signOut() {
  await auth().signOut();
  await AsyncStorage.multiRemove(['auth_token', 'user_data']);
}

/**
 * Subscribe to Firebase auth state changes.
 * Returns the unsubscribe function.
 */
export function onAuthStateChanged(callback) {
  return auth().onAuthStateChanged(callback);
}

/**
 * Get the currently signed-in Firebase user (or null).
 */
export function getCurrentUser() {
  return auth().currentUser;
}
