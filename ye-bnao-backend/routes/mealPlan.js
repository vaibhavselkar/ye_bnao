const express = require('express');
const router = express.Router();
const { generateWeekPlan, regenerateSingleMeal } = require('../services/geminiService');

router.post('/generate', async (req, res) => {
  try {
    const { profile, language, history } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile is required' });
    const weekPlan = await generateWeekPlan({ profile, language: language || 'en', history: history || [] });
    res.json({ weekPlan, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Meal plan error:', err.message);
    res.status(500).json({ error: 'Failed to generate meal plan', details: err.message });
  }
});

router.post('/regenerate-meal', async (req, res) => {
  try {
    const { profile, language, dayIndex, mealType, currentWeekPlan } = req.body;
    if (!profile || mealType === undefined || dayIndex === undefined) {
      return res.status(400).json({ error: 'profile, dayIndex, mealType are required' });
    }
    const meal = await regenerateSingleMeal({ profile, language: language || 'en', dayIndex, mealType, currentWeekPlan });
    res.json({ meal });
  } catch (err) {
    console.error('Regenerate meal error:', err.message);
    res.status(500).json({ error: 'Failed to regenerate meal', details: err.message });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { userId, mealName, rating } = req.body;
    console.log('Feedback received:', { userId, mealName, rating });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

module.exports = router;
