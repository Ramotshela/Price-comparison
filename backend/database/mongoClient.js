const { MongoClient } = require('mongodb');
const config = require('../config');

let client;
let database;

async function connectToDatabase() {
  if (database) return database;
  client = new MongoClient(config.mongoUri);
  await client.connect();
  console.log('Connected successfully to MongoDB');
  database = client.db(config.dbName);
  return database;
}

async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = { connectToDatabase, closeConnection };
