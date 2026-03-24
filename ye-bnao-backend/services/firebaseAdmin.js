const admin = require('firebase-admin');

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccount = raw ? JSON.parse(raw.trim()) : undefined;

  if (serviceAccount) {
    serviceAccount.project_id = serviceAccount.project_id.trim();
    serviceAccount.client_email = serviceAccount.client_email.trim();
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
  });
}

module.exports = admin;
