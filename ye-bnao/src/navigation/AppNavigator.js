import { I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/colors';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/Auth/LanguageSelectionScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import RecipeDetailScreen from '../screens/Home/RecipeDetailScreen';
import RecipeHistoryScreen from '../screens/Home/RecipeHistoryScreen';
import LeftoverScreen from '../screens/Home/LeftoverScreen';
import FestivalScreen from '../screens/Home/FestivalScreen';
import FeedbackScreen from '../screens/Home/FeedbackScreen';
import SubscriptionScreen from '../screens/Subscription/SubscriptionScreen';
import SabziGuideScreen from '../screens/SabziGuide/SabziGuideScreen';
import GroceryScreen from '../screens/Grocery/GroceryScreen';
import TrendsScreen from '../screens/Trends/TrendsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            SabziGuide: focused ? 'leaf' : 'leaf-outline',
            Grocery: focused ? 'cart' : 'cart-outline',
            Trends: focused ? 'trending-up' : 'trending-up-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, paddingBottom: 5, height: 60 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="SabziGuide" component={SabziGuideScreen} options={{ tabBarLabel: t('nav.sabziGuide') }} />
      <Tab.Screen name="Grocery" component={GroceryScreen} options={{ tabBarLabel: t('nav.grocery') }} />
      <Tab.Screen name="Trends" component={TrendsScreen} options={{ tabBarLabel: t('nav.trends') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const direction = I18nManager.isRTL ? 'rtl' : 'ltr';
  return (
    <NavigationContainer direction={direction}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="RecipeHistory" component={RecipeHistoryScreen} />
        <Stack.Screen name="Leftover" component={LeftoverScreen} />
        <Stack.Screen name="Festival" component={FestivalScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
