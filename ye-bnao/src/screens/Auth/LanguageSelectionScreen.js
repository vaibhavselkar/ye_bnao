import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, Dimensions, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, RTL_LANGUAGES } from '../../constants/languages';
import { COLORS } from '../../constants/colors';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

export default function LanguageSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();
  const { changeLanguage } = useApp();

  const handleConfirm = async () => {
    if (!selected) { Alert.alert('Please select a language'); return; }
    setLoading(true);
    try {
      await i18n.changeLanguage(selected);
      const { requiresRestart } = await changeLanguage(selected);

      if (requiresRestart) {
        // App will reload automatically via expo-updates.
        // Show alert as fallback in case reload doesn't fire immediately.
        Alert.alert(
          'Restarting',
          'Applying right-to-left layout. The app will restart now.',
          [{ text: 'OK' }]
        );
      } else {
        navigation.replace('Login');
      }
    } catch {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selected === item.code;
    return (
      <TouchableOpacity
        style={[styles.langCard, isSelected && styles.langCardSelected]}
        onPress={() => setSelected(item.code)}
        activeOpacity={0.7}
      >
        <Text style={[styles.nativeName, isSelected && styles.nativeNameSelected, item.rtl && { textAlign: 'right' }]}>
          {item.nativeName}
        </Text>
        <Text style={[styles.engName, isSelected && styles.engNameSelected]}>{item.name}</Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🌏</Text>
        <Text style={styles.headerTitle}>Choose Your Language</Text>
        <Text style={styles.headerSubtitle}>अपनी भाषा चुनें</Text>
      </View>
      <FlatList
        data={LANGUAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.code}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selected || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Continue →</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  list: { padding: 12, paddingBottom: 16 },
  row: { justifyContent: 'space-between', marginBottom: 8 },
  langCard: {
    width: ITEM_WIDTH, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 2, borderColor: COLORS.border,
    position: 'relative', minHeight: 80, justifyContent: 'center',
  },
  langCardSelected: { borderColor: COLORS.primary, backgroundColor: '#FFF0EE' },
  nativeName: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary, textAlign: 'center' },
  nativeNameSelected: { color: COLORS.primary },
  engName: { fontSize: 12, color: COLORS.text.muted, marginTop: 4 },
  engNameSelected: { color: COLORS.primary },
  checkmark: { position: 'absolute', top: 8, right: 10, color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  footer: { padding: 16, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  confirmBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: COLORS.text.muted },
  confirmText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
