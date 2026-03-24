const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || 'ye-bnao-otp-secret-key-2024';

function getAdmin() {
  if (admin.apps.length) return admin;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await resend.emails.send({
      from: 'Ye Bnao <onboarding@resend.dev>',
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

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    const token = jwt.sign({ phone: cleanPhone, email, otp }, JWT_SECRET, { expiresIn: '10m' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('send-otp error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP' });
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
    const firebaseAdmin = getAdmin();

    let user;
    try {
      user = await firebaseAdmin.auth().getUserByPhoneNumber(phone);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        user = await firebaseAdmin.auth().createUser({ phoneNumber: phone });
      } else {
        throw e;
      }
    }

    const customToken = await firebaseAdmin.auth().createCustomToken(user.uid);
    res.json({ success: true, customToken, uid: user.uid, phone, email: payload.email });
  } catch (err) {
    console.error('verify-otp error:', err.message);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

module.exports = router;
