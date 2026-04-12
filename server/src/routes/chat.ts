import { Router } from 'express';
import OpenAI from 'openai';
import { taskService } from '../services/taskService';
import { shoppingService } from '../services/shoppingService';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM = `Tu es Walle, l'assistant IA personnel et attachant d'un tableau de bord domestique installé sur un mur. Tu es curieux, bienveillant, légèrement espiègle, et tu parles toujours en français avec chaleur et naturel.

Tu as accès aux données actuelles de la maison (tâches du jour, liste de courses, configuration des widgets) et tu peux y faire référence de façon naturelle et utile.

Règles :
- Réponds toujours en français
- Sois concis et naturel (2-4 phrases sauf si la question nécessite plus de détails)
- Utilise concrètement le contexte de la maison fourni pour personnaliser ta réponse
- Sois utile, précis, et agréable
- Tu peux utiliser quelques emojis pour donner vie à tes réponses`;

function buildContext(
  widgetConfig: Record<string, { config?: Record<string, unknown> }>,
  tasks: Array<{ title: string; completed?: number; time?: string; category?: string }>,
  shopping: Array<{ name: string; completed?: number; quantity?: string; category?: string }>,
): string {
  const parts: string[] = [];

  const weather = widgetConfig?.weather?.config;
  if (weather) parts.push(`Météo configurée pour : ${weather.city ?? 'Paris'} (${weather.unit ?? 'celsius'})`);

  const brocante = widgetConfig?.brocante?.config;
  if (brocante) parts.push(`Brocantes surveillées autour de : ${brocante.city ?? 'Paris'} (rayon ${brocante.radiusKm ?? 30} km)`);

  const football = widgetConfig?.football?.config;
  if (football && Array.isArray(football.teams)) {
    parts.push(`Équipes de foot suivies : ${(football.teams as string[]).join(', ')}`);
  }

  const pending = tasks.filter(t => !t.completed);
  const done    = tasks.filter(t => t.completed);
  if (pending.length) parts.push(`Tâches du jour en attente (${pending.length}) : ${pending.map(t => t.title).join(', ')}`);
  else                parts.push("Aucune tâche en attente aujourd'hui");
  if (done.length)    parts.push(`Tâches déjà terminées : ${done.map(t => t.title).join(', ')}`);

  const pendingShopping = shopping.filter(s => !s.completed);
  if (pendingShopping.length) {
    parts.push(`Liste de courses (${pendingShopping.length} articles) : ${pendingShopping.map(s => s.quantity ? `${s.quantity} ${s.name}` : s.name).join(', ')}`);
  } else {
    parts.push('Liste de courses vide');
  }

  return parts.join('\n');
}

export function chatRouter(): Router {
  const router = Router();

  router.post('/message', async (req, res) => {
    const { message, history = [], widgetConfig = {} } = req.body as {
      message: string;
      history: Array<{ role: 'user' | 'assistant'; content: string }>;
      widgetConfig: Record<string, { config?: Record<string, unknown> }>;
    };

    if (!message?.trim()) return res.status(400).json({ error: 'Message vide' });

    const today    = new Date().toISOString().split('T')[0];
    const tasks    = taskService.getByDate(today);
    const shopping = shoppingService.getAll();
    const context  = buildContext(widgetConfig, tasks, shopping);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!openai) {
      const demo = `Bonjour ! Je suis Walle 🤖 En ce moment je tourne en mode démo. Voici ce que je sais : ${context}. Configure une clé OPENAI_API_KEY pour que je puisse vraiment te répondre !`;
      res.write(`data: ${JSON.stringify({ text: demo })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    try {
      const systemText = context
        ? `${SYSTEM}\n\n## Données actuelles de la maison :\n${context}`
        : SYSTEM;

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemText },
        ...history.slice(-10).map(m => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam),
        { role: 'user', content: message },
      ];

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 600,
        stream: true,
        messages,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      console.error('Chat error:', err);
      res.write(`data: ${JSON.stringify({ text: "Oups, j'ai eu un petit souci ! Réessaie dans un instant. 🤖" })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  });

  return router;
}
