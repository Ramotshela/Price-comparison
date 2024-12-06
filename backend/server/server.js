const express = require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../database/mongoClient');
const productRoutes = require('../routes/product');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Fixed: Call the cors middleware function

async function startServer() {
    try {
        const database = await connectToDatabase();
        app.use('/', productRoutes(database));

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Error starting the server:", err);
    }
}

startServer();
