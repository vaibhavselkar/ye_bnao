import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/colors';

const CATEGORIES = ['vegetables', 'dalAndGrains', 'spices', 'dairy', 'miscellaneous'];
const CAT_ICONS = { vegetables: '🥬', dalAndGrains: '🌾', spices: '🌶', dairy: '🥛', miscellaneous: '🛍' };

export default function GroceryScreen() {
  const { t } = useTranslation();
  const { groceryList, addToGrocery, removeFromGrocery } = useApp();
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState('vegetables');
  const [checked, setChecked] = useState({});

  const catLabel = (cat) => ({
    vegetables: t('grocery.vegetables', 'Vegetables'),
    dalAndGrains: t('grocery.dalAndGrains', 'Dal & Grains'),
    spices: t('grocery.spices', 'Spices'),
    dairy: t('grocery.dairy', 'Dairy'),
    miscellaneous: t('grocery.miscellaneous', 'Misc'),
  }[cat] || cat);

  const addItem = () => {
    if (newItem.trim()) { addToGrocery(activeCategory, newItem.trim()); setNewItem(''); }
  };

  const totalItems = CATEGORIES.reduce((sum, cat) => sum + (groceryList[cat]?.length || 0), 0);

  const shareWhatsApp = async () => {
    const lines = [`🛒 *${t('grocery.title', 'Grocery List')}*\n`];
    CATEGORIES.forEach(cat => {
      const items = groceryList[cat];
      if (items?.length > 0) {
        lines.push(`*${catLabel(cat)}*`);
        items.forEach(item => lines.push(`• ${item}`));
        lines.push('');
      }
    });
    lines.push('_Sent via Ye Bnao App_');
    try { await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(lines.join('\n'))}`); }
    catch { Alert.alert('WhatsApp not installed'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 {t('grocery.title', 'Grocery List')}</Text>
        {totalItems > 0 && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareWhatsApp}>
            <Text style={styles.shareBtnText}>📱 Share</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
        {CATEGORIES.map(cat => {
          const count = groceryList[cat]?.length || 0;
          return (
            <TouchableOpacity key={cat} style={[styles.tab, activeCategory === cat && styles.tabActive]} onPress={() => setActiveCategory(cat)}>
              <Text style={styles.tabIcon}>{CAT_ICONS[cat]}</Text>
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>{catLabel(cat)}</Text>
              {count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* Add Input */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput} value={newItem} onChangeText={setNewItem}
            placeholder={`Add to ${catLabel(activeCategory)}...`}
            onSubmitEditing={addItem} returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        {(groceryList[activeCategory]?.length || 0) > 0 ? (
          groceryList[activeCategory].map((item, idx) => {
            const key = `${activeCategory}_${idx}`;
            return (
              <View key={idx} style={styles.item}>
                <TouchableOpacity onPress={() => setChecked(p => ({ ...p, [key]: !p[key] }))} style={styles.checkArea}>
                  <Text style={[styles.checkIcon, checked[key] && styles.checkIconDone]}>{checked[key] ? '✅' : '⬜'}</Text>
                </TouchableOpacity>
                <Text style={[styles.itemText, checked[key] && styles.itemDone]}>{item}</Text>
                <TouchableOpacity onPress={() => removeFromGrocery(activeCategory, idx)} style={styles.delBtn}>
                  <Text style={styles.delIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{CAT_ICONS[activeCategory]}</Text>
            <Text style={styles.emptyText}>{t('grocery.emptyList', 'No items yet')}</Text>
            <Text style={styles.emptyHint}>Add items above or generate from your meal plan</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.primary },
  shareBtn: { backgroundColor: '#25D366', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabs: { flexGrow: 0, marginBottom: 12 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabIcon: { fontSize: 16, marginRight: 6 },
  tabText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.secondary, borderRadius: 8, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.text.primary },
  list: { flex: 1, paddingHorizontal: 16 },
  addRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  addInput: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  checkArea: { marginRight: 10 },
  checkIcon: { fontSize: 20 },
  checkIconDone: { opacity: 0.7 },
  itemText: { flex: 1, fontSize: 16, color: COLORS.text.primary },
  itemDone: { textDecorationLine: 'line-through', color: COLORS.text.muted },
  delBtn: { padding: 4 },
  delIcon: { fontSize: 13, color: COLORS.text.muted },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 17, color: COLORS.text.secondary, fontWeight: '600' },
  emptyHint: { fontSize: 13, color: COLORS.text.muted, marginTop: 6, textAlign: 'center' },
});
