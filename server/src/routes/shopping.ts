import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';
import { shoppingService } from '../services/shoppingService';

export function shoppingRouter(io: Server): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(shoppingService.getAll());
  });

  router.post('/', (req: Request, res: Response) => {
    const { name, quantity, category, recurring } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const item = shoppingService.create({ name, quantity, category, recurring });
    io.to('walle').emit('shopping:created', item);
    return res.status(201).json(item);
  });

  router.put('/:id', (req: Request, res: Response) => {
    const item = shoppingService.update(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    io.to('walle').emit('shopping:updated', item);
    return res.json(item);
  });

  router.patch('/:id/complete', (req: Request, res: Response) => {
    const item = shoppingService.toggleComplete(Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Item not found' });
    io.to('walle').emit('shopping:updated', item);
    return res.json(item);
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = shoppingService.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    io.to('walle').emit('shopping:deleted', { id: Number(req.params.id) });
    return res.status(204).send();
  });

  router.post('/reset', (_req: Request, res: Response) => {
    shoppingService.resetList();
    io.to('walle').emit('shopping:reset');
    return res.json({ ok: true });
  });

  return router;
}
