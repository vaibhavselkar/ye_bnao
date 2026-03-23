const admin = require('firebase-admin');

if (!admin.apps.length) {
  // In production: set FIREBASE_SERVICE_ACCOUNT env var to the JSON string
  // of your Firebase service account key (from Firebase Console →
  // Project Settings → Service Accounts → Generate new private key).
  //
  // Locally: place serviceAccountKey.json in the backend root and set
  // GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
  // OR paste the JSON as FIREBASE_SERVICE_ACCOUNT env var.

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

module.exports = admin;
