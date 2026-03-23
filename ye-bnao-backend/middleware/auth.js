const admin = require('../services/firebaseAdmin');

/**
 * Express middleware that verifies the Firebase ID token from the
 * Authorization: Bearer <token> header.
 *
 * Guest requests (token = "guest") are allowed through with uid = "guest".
 * All other requests must carry a valid Firebase token.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Allow guest access (token stored as literal string "guest")
  if (token === 'guest') {
    req.uid = 'guest';
    return next();
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
