const express = require('express');
const router = express.Router();
const { getSeasonalVegetables } = require('../services/geminiService');

router.post('/seasonal', async (req, res) => {
  try {
    const { profile, language } = req.body;
    const data = await getSeasonalVegetables({ profile, language: language || 'en' });
    res.json(data);
  } catch (err) {
    console.error('Sabzi error:', err.message);
    res.status(500).json({ error: 'Failed to get seasonal vegetables' });
  }
});

router.post('/weekend-list', async (req, res) => {
  try {
    const { profile, language } = req.body;
    // Uses same seasonal data with weekend framing
    const data = await getSeasonalVegetables({ profile, language: language || 'en' });
    res.json({
      buyThisWeekend: data.vegetables?.filter(v => v.status === 'in-season') || [],
      buyBeforeGone: data.vegetables?.filter(v => v.status === 'ending-soon') || [],
      comingSoon: data.vegetables?.filter(v => v.status === 'coming-soon') || [],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get weekend list' });
  }
});

module.exports = router;
