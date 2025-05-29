import { Request, Response } from 'express';
import { processResearchIngest as processIngest } from '../scripts/ingestResearchTabs';

export const processResearchIngest = async (req: Request, res: Response) => {
  try {
    await processIngest();
    res.status(200).json({ message: 'Research ingest completed successfully' });
  } catch (error) {
    console.error('Error in research ingest:', error);
    res.status(500).json({ error: 'Failed to process research ingest' });
  }
}; 