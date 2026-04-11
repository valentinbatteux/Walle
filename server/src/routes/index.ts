import { Router } from 'express';
import { Server } from 'socket.io';
import { tasksRouter } from './tasks';
import { shoppingRouter } from './shopping';
import { aiRouter } from './ai';
import { patternService } from '../services/patternService';

export function createRouter(io: Server): Router {
  const router = Router();

  router.use('/tasks', tasksRouter(io));
  router.use('/shopping', shoppingRouter(io));
  router.use('/ai', aiRouter());

  router.get('/patterns', (_req, res) => {
    res.json(patternService.getAll());
  });

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', ai: !!process.env.ANTHROPIC_API_KEY });
  });

  return router;
}
