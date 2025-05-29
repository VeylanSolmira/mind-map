import express from 'express';
import { ingestBookmarks } from '../services/researchService';

const router = express.Router();

router.post('/ingest', async (req, res) => {
  try {
    await ingestBookmarks();
    res.status(200).json({ message: 'Bookmarks ingested successfully' });
  } catch (error) {
    console.error('Error ingesting bookmarks:', error);
    res.status(500).json({ error: 'Failed to ingest bookmarks' });
  }
});

export default router; 