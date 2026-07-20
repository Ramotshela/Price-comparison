const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const SALT_ROUNDS = 10;

function signTokens(user) {
  const accessToken = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
}

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

      const { accessToken, refreshToken } = signTokens(user);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      );

      return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email },
      };
    },

    async refresh(refreshToken) {
      let payload;
      try {
        payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
      } catch {
        return null;
      }

      const { rows } = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
        [refreshToken]
      );
      if (rows.length === 0) return null;

      const userRows = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id]);
      if (userRows.rows.length === 0) return null;
      const user = userRows.rows[0];

      const { accessToken, refreshToken: newRefreshToken } = signTokens(user);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, newRefreshToken, expiresAt]
      );

      return { accessToken, refreshToken: newRefreshToken };
    },

    async logout(refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    },

    async updateProfile(id, fields) {
      const updates = [];
      const values = [];
      if (fields.name) { updates.push(`name = $${updates.length + 1}`); values.push(fields.name); }
      if (fields.email) { updates.push(`email = $${updates.length + 1}`); values.push(fields.email); }
      values.push(id);
      const { rows } = await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id, name, email, created_at`,
        values
      );
      return rows[0] || null;
    },

    async changePassword(id, currentPassword, newPassword) {
      const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [id]);
      if (rows.length === 0) return false;
      const valid = await bcrypt.compare(currentPassword, rows[0].password);
      if (!valid) return false;
      const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, id]);
      return true;
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
