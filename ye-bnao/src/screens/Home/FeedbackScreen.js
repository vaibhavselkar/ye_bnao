import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';

export default function FeedbackScreen({ navigation }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!rating) { Alert.alert('Please give a rating'); return; }
    Alert.alert('Thank you! 🙏', 'Your feedback helps us improve meal suggestions.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← {t('common.back', 'Back')}</Text></TouchableOpacity>
        <Text style={styles.title}>Rate & Feedback</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.question}>How was today's meal plan?</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Text style={[styles.star, rating >= n && styles.starFilled]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating === 0 ? 'Tap to rate' : ['', 'Not good', 'Okay', 'Good', 'Very Good', 'Excellent!'][rating]}
        </Text>
        <TextInput
          style={styles.textarea} value={comment} onChangeText={setComment}
          placeholder="Any comments or dish suggestions for tomorrow?"
          multiline numberOfLines={4} textAlignVertical="top"
        />
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>{t('common.submit', 'Submit Feedback')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  back: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary },
  content: { padding: 24 },
  question: { fontSize: 20, fontWeight: 'bold', color: COLORS.text.primary, textAlign: 'center', marginBottom: 28 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  star: { fontSize: 52, color: COLORS.border },
  starFilled: { color: COLORS.secondary },
  ratingLabel: { textAlign: 'center', fontSize: 16, color: COLORS.text.secondary, marginBottom: 24, fontWeight: '600' },
  textarea: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: COLORS.border, minHeight: 100, color: COLORS.text.primary, marginBottom: 20 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
