const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

const pool = new Pool(config.pg);

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      email       VARCHAR(255) UNIQUE NOT NULL,
      name        VARCHAR(255) NOT NULL,
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS grocery_lists (
      id          SERIAL PRIMARY KEY,
      user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        VARCHAR(255) NOT NULL DEFAULT 'My List',
      budget      NUMERIC(10,2),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          SERIAL PRIMARY KEY,
      user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT UNIQUE NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token   ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

    CREATE TABLE IF NOT EXISTS grocery_list_items (
      id              SERIAL PRIMARY KEY,
      list_id         INT NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
      product_id      VARCHAR(255) NOT NULL,
      product_name    VARCHAR(255) NOT NULL,
      price           VARCHAR(50) NOT NULL,
      image_url       TEXT,
      quantity        INT NOT NULL DEFAULT 1,
      added_at        TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  logger.info('Postgres schema initialized');
}

async function checkPgHealth() {
  await pool.query('SELECT 1');
}

async function closePgPool() {
  await pool.end();
  logger.info('Postgres pool closed');
}

module.exports = { pool, initSchema, checkPgHealth, closePgPool };
