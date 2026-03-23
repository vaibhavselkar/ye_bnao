const express = require('express');
const router = express.Router();
const { getLeftoverSuggestions } = require('../services/claudeService');

router.post('/suggestions', async (req, res) => {
  try {
    const { ingredients, profile, language } = req.body;
    if (!ingredients?.length) return res.status(400).json({ error: 'Ingredients are required' });
    const data = await getLeftoverSuggestions({ ingredients, profile, language: language || 'en' });
    res.json(data);
  } catch (err) {
    console.error('Leftover error:', err.message);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
