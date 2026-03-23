import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  // For real users: Firebase ID token stored after login
  // For guests: literal string "guest"
  const token = await AsyncStorage.getItem('auth_token');
  const user = await AsyncStorage.getItem('user_data');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (user) {
    const parsed = JSON.parse(user);
    if (parsed.isGuest) config.headers.Authorization = 'Bearer guest';
  }
  return config;
});

export const mealPlanAPI = {
  generate: (data) => api.post('/api/meal-plan/generate', data),
  getHistory: (userId) => api.get(`/api/meal-plan/history/${userId}`),
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
