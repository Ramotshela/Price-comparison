const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const SALT_ROUNDS = 10;

function authService(pool) {
  return {
    async register(name, email, password) {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const { rows } = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name, email, hash]
      );
      return rows[0];
    },

    async login(email, password) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length === 0) return null;

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      return {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      };
    },

    async findById(id) {
      const { rows } = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [id]
      );
      return rows[0] || null;
    },
  };
}

module.exports = authService;
