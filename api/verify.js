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
  const usersSnap = await db.ref('users').once('value');

  let isValid = false;

  usersSnap.forEach(childSnap => {
    const data = childSnap.val();
    const valid = data.generated?.find(k => k.key === key && k.expires > now);
    if (valid) isValid = true;
  });

  res.status(200).json({
    success: isValid,
    message: isValid ? 'Key is valid' : 'Key is invalid or expired'
  });
}
