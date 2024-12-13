const { MongoClient } = require('mongodb');

// Replace the URI string with your MongoDB connection string.
const uri = "mongodb+srv://rammakwaramotshela1:EkAldI6A2A974Igo@cluster0.am5pu.mongodb.net/";

// Create a new MongoClient
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        const database = client.db('shopriteDB'); // Database name
        return database;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

module.exports = connectToDatabase;
