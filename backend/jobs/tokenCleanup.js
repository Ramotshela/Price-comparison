const cron = require('node-cron');
const logger = require('../utils/logger');

function startTokenCleanup(pool) {
  cron.schedule('0 * * * *', async () => {
    try {
      const { rowCount } = await pool.query(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
      );
      if (rowCount > 0) {
        logger.info({ rowCount }, 'Token cleanup: removed expired refresh tokens');
      }
    } catch (err) {
      logger.error({ err }, 'Token cleanup failed');
    }
  });
}

module.exports = startTokenCleanup;
