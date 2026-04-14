const { Pool } = require('pg');
const config = require('../config');

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
  console.log('Postgres schema initialized');
}

async function closePgPool() {
  await pool.end();
  console.log('Postgres pool closed');
}

module.exports = { pool, initSchema, closePgPool };
