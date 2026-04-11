import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';
import { taskService } from '../services/taskService';

export function tasksRouter(io: Server): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const { date, from, to } = req.query as Record<string, string>;
    if (date) {
      return res.json(taskService.getByDate(date));
    }
    if (from && to) {
      return res.json(taskService.getByRange(from, to));
    }
    const today = new Date().toISOString().split('T')[0];
    return res.json(taskService.getByDate(today));
  });

  router.get('/:id', (req: Request, res: Response) => {
    const task = taskService.getById(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  });

  router.post('/', (req: Request, res: Response) => {
    const { title, description, date, time, recurring, category, priority, ai_suggested } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'title and date are required' });
    }
    const task = taskService.create({ title, description, date, time, recurring, category, priority, ai_suggested });
    io.to('walle').emit('task:created', task);
    return res.status(201).json(task);
  });

  router.put('/:id', (req: Request, res: Response) => {
    const task = taskService.update(Number(req.params.id), req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    io.to('walle').emit('task:updated', task);
    return res.json(task);
  });

  router.patch('/:id/complete', (req: Request, res: Response) => {
    const task = taskService.toggleComplete(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    io.to('walle').emit('task:updated', task);
    return res.json(task);
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = taskService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    io.to('walle').emit('task:deleted', { id: Number(req.params.id) });
    return res.status(204).send();
  });

  return router;
}
