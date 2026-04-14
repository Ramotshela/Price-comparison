const { ObjectId } = require('mongodb');

function productService(database) {
  const collection = database.collection('products');

  return {
    insertMany: (products) => collection.insertMany(products),
    getVegetables: async (page = 1, limit = 20) => {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        collection.find({ Category: 'Vegetables' }).skip(skip).limit(limit).toArray(),
        collection.countDocuments({ Category: 'Vegetables' }),
      ]);
      return { items, total, page, hasMore: skip + items.length < total };
    },
    getByIds: (ids) =>
      collection.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray(),
  };
}

module.exports = productService;
