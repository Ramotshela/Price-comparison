function groceryListService(pool) {
  return {
    async createList(userId, name = 'My List', budget = null) {
      const { rows } = await pool.query(
        'INSERT INTO grocery_lists (user_id, name, budget) VALUES ($1, $2, $3) RETURNING *',
        [userId, name, budget]
      );
      return rows[0];
    },

    async getLists(userId) {
      const { rows } = await pool.query(
        `SELECT gl.*,
           COALESCE(json_agg(
             json_build_object(
               'id', gli.id,
               'product_id', gli.product_id,
               'product_name', gli.product_name,
               'price', gli.price,
               'image_url', gli.image_url,
               'quantity', gli.quantity
             )
           ) FILTER (WHERE gli.id IS NOT NULL), '[]') AS items
         FROM grocery_lists gl
         LEFT JOIN grocery_list_items gli ON gli.list_id = gl.id
         WHERE gl.user_id = $1
         GROUP BY gl.id
         ORDER BY gl.updated_at DESC`,
        [userId]
      );
      return rows;
    },

    async getListById(listId, userId) {
      const { rows } = await pool.query(
        `SELECT gl.*,
           COALESCE(json_agg(
             json_build_object(
               'id', gli.id,
               'product_id', gli.product_id,
               'product_name', gli.product_name,
               'price', gli.price,
               'image_url', gli.image_url,
               'quantity', gli.quantity
             )
           ) FILTER (WHERE gli.id IS NOT NULL), '[]') AS items
         FROM grocery_lists gl
         LEFT JOIN grocery_list_items gli ON gli.list_id = gl.id
         WHERE gl.id = $1 AND gl.user_id = $2
         GROUP BY gl.id`,
        [listId, userId]
      );
      return rows[0] || null;
    },

    async updateBudget(listId, userId, budget) {
      const { rows } = await pool.query(
        'UPDATE grocery_lists SET budget = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
        [budget, listId, userId]
      );
      return rows[0] || null;
    },

    async deleteList(listId, userId) {
      const { rowCount } = await pool.query(
        'DELETE FROM grocery_lists WHERE id = $1 AND user_id = $2',
        [listId, userId]
      );
      return rowCount > 0;
    },

    async addItem(listId, userId, item) {
      const owns = await pool.query(
        'SELECT id FROM grocery_lists WHERE id = $1 AND user_id = $2',
        [listId, userId]
      );
      if (owns.rows.length === 0) return null;

      const existing = await pool.query(
        'SELECT id, quantity FROM grocery_list_items WHERE list_id = $1 AND product_id = $2',
        [listId, item.product_id]
      );

      let result;
      if (existing.rows.length > 0) {
        result = await pool.query(
          'UPDATE grocery_list_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
          [item.quantity || 1, existing.rows[0].id]
        );
      } else {
        result = await pool.query(
          `INSERT INTO grocery_list_items (list_id, product_id, product_name, price, image_url, quantity)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [listId, item.product_id, item.product_name, item.price, item.image_url || null, item.quantity || 1]
        );
      }

      await pool.query('UPDATE grocery_lists SET updated_at = NOW() WHERE id = $1', [listId]);
      return result.rows[0];
    },

    async updateItemQuantity(itemId, listId, userId, quantity) {
      const owns = await pool.query(
        'SELECT id FROM grocery_lists WHERE id = $1 AND user_id = $2',
        [listId, userId]
      );
      if (owns.rows.length === 0) return null;

      const { rows } = await pool.query(
        'UPDATE grocery_list_items SET quantity = $1 WHERE id = $2 AND list_id = $3 RETURNING *',
        [quantity, itemId, listId]
      );
      if (rows.length > 0) {
        await pool.query('UPDATE grocery_lists SET updated_at = NOW() WHERE id = $1', [listId]);
      }
      return rows[0] || null;
    },

    async removeItem(itemId, listId, userId) {
      const owns = await pool.query(
        'SELECT id FROM grocery_lists WHERE id = $1 AND user_id = $2',
        [listId, userId]
      );
      if (owns.rows.length === 0) return false;

      const { rowCount } = await pool.query(
        'DELETE FROM grocery_list_items WHERE id = $1 AND list_id = $2',
        [itemId, listId]
      );
      if (rowCount > 0) {
        await pool.query('UPDATE grocery_lists SET updated_at = NOW() WHERE id = $1', [listId]);
      }
      return rowCount > 0;
    },
  };
}

module.exports = groceryListService;
