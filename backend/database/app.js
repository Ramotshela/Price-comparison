const { MongoClient } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

// Replace the URI string with your MongoDB connection string.
const uri = "mongodb+srv://rammakwaramotshela1:EkAldI6A2A974Igo@cluster0.dsmuw.mongodb.net/";

// Create a new MongoClient
const client = new MongoClient(uri);

const app = express();
app.use(bodyParser.json());

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected successfully to MongoDB");

        // Establish and select a database
        const database = client.db('myDatabase'); // database name.
        const collection = database.collection('myCollection'); // collection name.

        // POST route to receive and insert data into MongoDB
        app.post('/insert-products', async (req, res) => {
            try {
                const products = req.body;  // The scraped data from Python script
                const result = await collection.insertMany(products);
                res.status(200).send(`Inserted ${result.insertedCount} documents into MongoDB`);
            } catch (err) {
                console.error(err);
                res.status(500).send("Error inserting documents into MongoDB");
            }
        });

        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    } catch (err) {
        console.error(err);
    }
}

run().catch(console.dir);
