import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDB } from './db/database';
import { createRouter } from './routes';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
});

app.use(cors());
app.use(express.json());
app.use('/api', createRouter(io));

// Serve built frontend in production
const distPath = path.join(__dirname, '../../client/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

initSocket(io);

const PORT = Number(process.env.PORT) || 3001;

initDB()
  .then(() => {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Walle server → http://localhost:${PORT}`);
      console.log(`AI suggestions: ${process.env.ANTHROPIC_API_KEY ? 'enabled' : 'disabled (set ANTHROPIC_API_KEY)'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
