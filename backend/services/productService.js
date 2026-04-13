const { ObjectId } = require('mongodb');

function productService(database) {
  const collection = database.collection('products');

  return {
    insertMany: (products) => collection.insertMany(products),
    getVegetables: () => collection.find({ Category: 'Vegetables' }).toArray(),
    getByIds: (ids) =>
      collection.find({ _id: { $in: ids.map((id) => new ObjectId(id)) } }).toArray(),
  };
}

module.exports = productService;
