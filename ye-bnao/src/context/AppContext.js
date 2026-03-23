import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RTL_LANGUAGES } from '../constants/languages';
import { applyRTLForLanguage } from '../utils/rtl';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [user, setUser] = useState(null);
  const [familyProfile, setFamilyProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState({
    vegetables: [], dalAndGrains: [], spices: [], dairy: [], miscellaneous: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [savedLang, savedProfile, savedUser, savedGrocery] = await AsyncStorage.multiGet([
        'app_language', 'family_profile', 'user_data', 'grocery_list',
      ]);
      if (savedLang[1]) {
        setLanguageState(savedLang[1]);
        setIsRTL(RTL_LANGUAGES.includes(savedLang[1]));
      }
      if (savedProfile[1]) setFamilyProfile(JSON.parse(savedProfile[1]));
      if (savedUser[1]) setUser(JSON.parse(savedUser[1]));
      if (savedGrocery[1]) setGroceryList(JSON.parse(savedGrocery[1]));
    } catch (e) {
      console.error('Error loading saved data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (langCode) => {
    try {
      await AsyncStorage.setItem('app_language', langCode);
      const { needsChange, isRTL } = applyRTLForLanguage(langCode);

      if (needsChange) {
        // RTL layout flipped — must reload the JS bundle to take effect
        try {
          const Updates = require('expo-updates');
          await Updates.reloadAsync();
          return { requiresRestart: true }; // unreachable after reload
        } catch {
          // expo-updates unavailable — layout corrects on next cold start
          return { requiresRestart: true };
        }
      }

      setLanguageState(langCode);
      setIsRTL(isRTL);
      return { requiresRestart: false };
    } catch (e) {
      return { requiresRestart: false };
    }
  };

  const saveProfile = async (profile) => {
    await AsyncStorage.setItem('family_profile', JSON.stringify(profile));
    setFamilyProfile(profile);
  };

  const addToGrocery = async (category, item) => {
    const updated = {
      ...groceryList,
      [category]: [...(groceryList[category] || []), item],
    };
    setGroceryList(updated);
    await AsyncStorage.setItem('grocery_list', JSON.stringify(updated));
  };

  const removeFromGrocery = async (category, index) => {
    const updated = {
      ...groceryList,
      [category]: groceryList[category].filter((_, i) => i !== index),
    };
    setGroceryList(updated);
    await AsyncStorage.setItem('grocery_list', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      language, changeLanguage, isRTL,
      user, setUser,
      familyProfile, saveProfile,
      mealPlan, setMealPlan,
      groceryList, addToGrocery, removeFromGrocery, setGroceryList,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
