const express = require('express');
const router = express.Router();
const { generateMealPlan } = require('../services/geminiService');

router.post('/generate', async (req, res) => {
  try {
    const { profile, language, date, history } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile is required' });

    const mealPlan = await generateMealPlan({ profile, language: language || 'en', date: date || new Date().toISOString(), history: history || [] });
    res.json({ mealPlan, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Meal plan error:', err.message);
    res.status(500).json({ error: 'Failed to generate meal plan', details: err.message });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { userId, mealName, rating, comment, date } = req.body;
    // In production: save to Firestore
    console.log('Feedback received:', { userId, mealName, rating });
    res.json({ success: true, message: 'Feedback saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

module.exports = router;
