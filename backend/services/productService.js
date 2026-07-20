const { ObjectId } = require('mongodb');

function productService(database) {
  const collection = database.collection('products');

  // Ensure unique index on Shop Name + Product Name
  collection.createIndex(
    { 'Shop Name': 1, 'Product Name': 1 },
    { unique: true, background: true }
  ).catch((err) => {
    const logger = require('../utils/logger');
    logger.warn({ err }, 'Could not create unique index on products — duplicates may exist');
  });

  return {
    upsertMany: async (products) => {
      if (products.length === 0) return { upsertedCount: 0, modifiedCount: 0 };
      const ops = products.map((p) => ({
        updateOne: {
          filter: { 'Shop Name': p['Shop Name'], 'Product Name': p['Product Name'] },
          update: { $set: p },
          upsert: true,
        },
      }));
      const result = await collection.bulkWrite(ops, { ordered: false });
      return {
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
      };
    },
    syncProducts: async (shopName, products) => {
      if (products.length === 0) return { upsertedCount: 0, modifiedCount: 0, deletedCount: 0 };
      // Upsert all scraped products
      const ops = products.map((p) => ({
        updateOne: {
          filter: { 'Shop Name': p['Shop Name'], 'Product Name': p['Product Name'] },
          update: { $set: p },
          upsert: true,
        },
      }));
      const bulkResult = await collection.bulkWrite(ops, { ordered: false });
      // Delete products from this store that were not in the scraped batch
      const scrapedNames = products.map((p) => p['Product Name']);
      const { deletedCount } = await collection.deleteMany({
        'Shop Name': shopName,
        'Product Name': { $nin: scrapedNames },
      });
      return {
        upsertedCount: bulkResult.upsertedCount,
        modifiedCount: bulkResult.modifiedCount,
        deletedCount,
      };
    },
    getProducts: async ({ page = 1, limit = 20, category, shop, search } = {}) => {
      const filter = {};
      if (category) filter['Category'] = category;
      if (shop) filter['Shop Name'] = shop;
      if (search) filter['Product Name'] = { $regex: search, $options: 'i' };
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        collection.find(filter).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);
      return { items, total, page, hasMore: skip + items.length < total };
    },
    getCategories: () => collection.distinct('Category'),
    getShops: () => collection.distinct('Shop Name'),
    getByIds: (ids) =>
      collection.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray(),
  };
}

module.exports = productService;
