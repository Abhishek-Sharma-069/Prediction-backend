import express from 'express';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = config.port || 3000;

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

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
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
});
