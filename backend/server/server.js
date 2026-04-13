const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');
const swaggerSpec = require('../config/swagger');
const { connectToDatabase, closeConnection } = require('../database/mongoClient');
const productRoutes = require('../routes/product');
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Parsing & logging
app.use(express.json({ limit: '1mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function startServer() {
  const database = await connectToDatabase();
  app.use('/', productRoutes(database));
  app.use(errorHandler);

  const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Swagger docs at http://localhost:${config.port}/api-docs`);
  });

  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await closeConnection();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal: failed to start server', err);
  process.exit(1);
});
