const express = require('express');
const router = express.Router();
const { getLocalTrends } = require('../services/geminiService');

router.post('/local', async (req, res) => {
  try {
    const { profile, language } = req.body;
    const data = await getLocalTrends({ profile, language: language || 'en' });
    res.json(data);
  } catch (err) {
    console.error('Trends error:', err.message);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

module.exports = router;
