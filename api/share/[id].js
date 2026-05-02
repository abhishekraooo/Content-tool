import { db } from '../_firebase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const doc = await db.collection('saves').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching from Firestore:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
