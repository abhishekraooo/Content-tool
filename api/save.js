import { db } from './_firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { rawText, mode, poster, media } = req.body;

  if (!rawText || !mode || !poster || !media) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const saveObject = {
      rawText,
      mode,
      poster,
      media,
      savedAt: new Date().toISOString()
    };

    const ref = await db.collection('saves').add(saveObject);
    return res.status(200).json({ id: ref.id, url: `/share/${ref.id}` });
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
