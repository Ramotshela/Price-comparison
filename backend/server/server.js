const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');
const swaggerSpec = require('../config/swagger');
const logger = require('../utils/logger');
const { connectToDatabase, closeConnection } = require('../database/mongoClient');
const { pool, initSchema, closePgPool } = require('../database/pgClient');
const productRoutes = require('../routes/product');
const authRoutes = require('../routes/auth');
const groceryListRoutes = require('../routes/groceryList');
const errorHandler = require('../middleware/errorHandler');
const startTokenCleanup = require('../jobs/tokenCleanup');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Auth-specific stricter rate limit (10 requests per 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Parsing & logging
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

// Docs (dev only)
if (config.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

async function startServer() {
  const mongoDb = await connectToDatabase();
  await initSchema();

  // Background jobs
  startTokenCleanup(pool);

  // Routes
  app.use('/', productRoutes(mongoDb));
  app.use('/', authRoutes(pool));
  app.use('/', groceryListRoutes(pool));
  app.use(errorHandler);

  const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Server started');
  });

  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await closeConnection();
    await closePgPool();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  logger.fatal({ err }, 'Fatal: failed to start server');
  process.exit(1);
});
