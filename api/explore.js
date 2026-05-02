import { db } from './_firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const snapshot = await db.collection('saves')
      .orderBy('savedAt', 'desc')
      .limit(30)
      .get();

    const saves = snapshot.docs.map(doc => {
      const data = doc.data();
      const rawText = data.rawText || '';
      return {
        id: doc.id,
        rawText: rawText.slice(0, 120) + (rawText.length > 120 ? '...' : ''),
        poster: {
          title: data.poster?.title,
          achievement: data.poster?.achievement
        },
        mode: data.mode,
        savedAt: data.savedAt
      };
    });

    return res.status(200).json({ saves });
  } catch (error) {
    console.error('Error fetching explore from Firestore:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
