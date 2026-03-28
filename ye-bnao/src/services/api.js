import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import auth from '@react-native-firebase/auth';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 55000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const firebaseUser = auth().currentUser;
  if (firebaseUser) {
    // Always get a fresh token (auto-refreshes if expired)
    const idToken = await firebaseUser.getIdToken();
    await AsyncStorage.setItem('auth_token', idToken);
    config.headers.Authorization = `Bearer ${idToken}`;
  } else {
    const user = await AsyncStorage.getItem('user_data');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.isGuest) config.headers.Authorization = 'Bearer guest';
    }
  }
  return config;
});

export const mealPlanAPI = {
  generate: (data) => api.post('/api/meal-plan/generate', data),
  regenerateMeal: (data) => api.post('/api/meal-plan/regenerate-meal', data),
  saveFeedback: (data) => api.post('/api/meal-plan/feedback', data),
};

export const sabziAPI = {
  getSeasonal: (data) => api.post('/api/sabzi/seasonal', data),
  getWeekendList: (data) => api.post('/api/sabzi/weekend-list', data),
  getTips: (data) => api.post('/api/sabzi/tips', data),
};

export const trendsAPI = {
  getLocal: (data) => api.post('/api/trends/local', data),
};

export const leftoverAPI = {
  getSuggestions: (data) => api.post('/api/leftover/suggestions', data),
};

export const notificationsAPI = {
  registerToken: (data) => api.post('/api/notifications/register', data),
};

export default api;
