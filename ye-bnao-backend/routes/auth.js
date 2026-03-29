const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'ye-bnao-otp-secret-key-2024';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function getAdmin() {
  if (admin.apps.length) return admin;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.trim());
  // Sanitize fields to remove any stray whitespace/newlines
  serviceAccount.project_id = serviceAccount.project_id.trim();
  serviceAccount.client_email = serviceAccount.client_email.trim();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
}

// POST /auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone || !email) return res.status(400).json({ error: 'Phone number and email are required' });

    const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
    }

    const fullPhone = `+91${cleanPhone}`;
    const uid = 'ph_' + crypto.createHash('sha256').update(fullPhone).digest('hex').substring(0, 24);

    // Check if user already exists
    let isExisting = false;
    try {
      await getAdmin().auth().getUser(uid);
      isExisting = true;
    } catch (_) {}

    // Existing user — skip OTP, sign in directly
    if (isExisting) {
      const customToken = await getAdmin().auth().createCustomToken(uid, { phone: fullPhone, email });
      let profile = null;
      try {
        const db = getAdmin().firestore();
        const doc = await db.collection('profiles').doc(uid).get();
        if (doc.exists) profile = doc.data();
      } catch (_) {}
      return res.json({ success: true, isExisting: true, skipOTP: true, customToken, uid, phone: fullPhone, email, profile });
    }

    // New user — send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await getTransporter().sendMail({
      from: `"Ye Bnao" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your Ye Bnao OTP`,
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#C0392B;margin:0 0 8px;">👩‍🍳 Ye Bnao</h2>
          <p style="color:#444;margin:0 0 20px;">Your one-time password for login:</p>
          <div style="background:#fff5f5;border-radius:8px;padding:16px 24px;text-align:center;margin-bottom:20px;">
            <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#C0392B;">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">Valid for 10 minutes. Do not share this with anyone.</p>
        </div>
      `,
    });
    const token = jwt.sign({ phone: cleanPhone, email, otp }, JWT_SECRET, { expiresIn: '10m' });
    res.json({ success: true, token, isExisting: false, skipOTP: false });
  } catch (err) {
    console.error('send-otp error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { token, otp } = req.body;
    if (!token || !otp) return res.status(400).json({ error: 'Token and OTP are required' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (payload.otp !== otp.toString()) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    const phone = `+91${payload.phone}`;

    // Deterministic UID from phone — no HTTP call needed
    const uid = 'ph_' + crypto.createHash('sha256').update(phone).digest('hex').substring(0, 24);

    const customToken = await getAdmin().auth().createCustomToken(uid, { phone, email: payload.email });

    // Fetch saved profile from Firestore (survives reinstalls)
    let profile = null;
    try {
      const db = getAdmin().firestore();
      const doc = await db.collection('profiles').doc(uid).get();
      if (doc.exists) profile = doc.data();
    } catch (_) {}

    res.json({ success: true, customToken, uid, phone, email: payload.email, profile });
  } catch (err) {
    console.error('verify-otp error:', err.code, err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
