const express = require('express');
const router = express.Router();
const admin = require('../services/firebaseAdmin');

// POST /api/profile/save
router.post('/save', async (req, res) => {
  try {
    const uid = req.uid; // set by requireAuth middleware
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'profile required' });

    await admin.firestore().collection('profiles').doc(uid).set(profile, { merge: true });
    res.json({ success: true });
  } catch (err) {
    console.error('profile save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const uid = req.uid;
    const doc = await admin.firestore().collection('profiles').doc(uid).get();
    if (!doc.exists) return res.json({ profile: null });
    res.json({ profile: doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
