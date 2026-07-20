const { MongoClient } = require('mongodb');
const config = require('../config');
const logger = require('../utils/logger');

let client;
let database;

async function connectToDatabase() {
  if (database) return database;
  client = new MongoClient(config.mongoUri);
  await client.connect();
  logger.info('Connected successfully to MongoDB');
  database = client.db(config.dbName);
  return database;
}

async function checkMongoHealth() {
  await client.db('admin').command({ ping: 1 });
}

async function closeConnection() {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
}

module.exports = { connectToDatabase, checkMongoHealth, closeConnection };
