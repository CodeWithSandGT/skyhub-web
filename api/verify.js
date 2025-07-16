import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FB_PROJECT_ID,
    clientEmail: process.env.FB_CLIENT_EMAIL,
    privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FB_DATABASE_URL,
  });
}

const db = admin.database();

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ success: false, message: 'No key provided' });
  }

  const now = Date.now();
  try {
    const keyData = (await db.ref(`keys/${key}`).once('value')).val();
    console.log(`API /verify cek kunci ${key}:`, keyData);
    if (!keyData || (keyData.expires && keyData.expires <= now)) {
      return res.status(200).json({ success: false, message: 'Key is invalid or expired' });
    }
    return res.status(200).json({ success: true, message: 'Key is valid' });
  } catch (error) {
    console.error('Error di API /verify:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, please try again later' });
  }
}