import { Router, Request, Response } from 'express';
import { getSuggestions, recordFeedback } from '../services/aiService';
import { taskService } from '../services/taskService';

export function aiRouter(): Router {
  const router = Router();

  router.get('/suggestions', async (req: Request, res: Response) => {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const existingTasks = taskService.getByDate(date);
    const suggestions = await getSuggestions(date, existingTasks);
    res.json(suggestions);
  });

  router.post('/feedback', async (req: Request, res: Response) => {
    const { suggestion_text, accepted, date_context } = req.body;
    if (!suggestion_text || !date_context) {
      return res.status(400).json({ error: 'suggestion_text and date_context are required' });
    }
    await recordFeedback(suggestion_text, !!accepted, date_context);
    return res.json({ ok: true });
  });

  return router;
}
