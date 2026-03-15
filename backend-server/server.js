import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from './src/config/config.js';
import { prisma } from './src/lib/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import routes from './src/routes/index.js';
import { requestLogger } from './src/middlewares/requestLogger.middleware.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import { runAutomationJob } from './src/services/automation.service.js';

dotenv.config();

const app = express();
const PORT = config.port || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Development' }],
  },
  apis: [
    path.join(__dirname, 'src', 'routes', '*.js'),
    path.join(__dirname, 'server.js'),
  ],
};

if (config.nodeEnv === 'development') {
  const spec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ message: 'welcome on the Prediction Server' });
});
app.use('/api', routes);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
}); 

app.use(errorHandler);

try {
  await prisma.$connect();
  console.log('Database connected');
} catch (e) {
  console.error('Database connection failed:', e.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);

  // Automation job: set ACTIVE_AUTOMATION=yes and AUTOMATION_INTERVAL_MS=<milliseconds> in .env
  const activeAutomation = (process.env.ACTIVE_AUTOMATION || '').toLowerCase() === 'yes';
  const intervalMs = Number(process.env.AUTOMATION_INTERVAL_MS) || 0;
  if (activeAutomation && intervalMs > 0) {
    setInterval(async () => {
      try {
        const result = await runAutomationJob();
        console.log('[Automation]', result);
      } catch (err) {
        console.error('[Automation]', err.message);
      }
    }, intervalMs);
    console.log(`Automation job scheduled every ${intervalMs} ms`);
  }
});
