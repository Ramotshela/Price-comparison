const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'shopriteDB',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pg: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'pricecompare',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
  },
  scraperApiKey: process.env.SCRAPER_API_KEY || (() => {
    if (process.env.NODE_ENV === 'production') throw new Error('SCRAPER_API_KEY must be set in production');
    return 'change-me-in-development';
  })(),
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production');
      return 'change-me-in-development';
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') throw new Error('REFRESH_TOKEN_SECRET must be set in production');
      return 'refresh-change-me-in-development';
    })(),
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
};
