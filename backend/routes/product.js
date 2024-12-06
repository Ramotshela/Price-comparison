const express = require("express");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb"); // Import ObjectId for MongoDB queries
const router = express.Router();

module.exports = (database) => {
  const collection = database.collection("myCollection"); // Collection name

  // POST route to insert products
  router.post("/insert-products", async (req, res) => {
    try {
      const products = req.body;
      const result = await collection.insertMany(products);
      res
        .status(200)
        .send(`Inserted ${result.insertedCount} documents into MongoDB`);
    } catch (err) {
      console.error("Error inserting documents:", err);
      res.status(500).send("Error inserting documents into MongoDB");
    }
  });

  // GET route to fetch vegetables
  router.get("/fruits&veg", async (req, res) => {
    try {
      const vegetables = await collection.find({ category: "vegetables" }).toArray();
      res.json(vegetables);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
      res.status(500).json({ error: "Error fetching vegetables" });
    }
  });

  // POST route to calculate total price and notify user
  router.post("/verify-total", async (req, res) => {
    try {
      const { productIds, userTotalPrice, userEmail } = req.body;

      // Fetch matching products from the database
      const products = await collection
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .toArray();

      if (products.length === 0) {
        return res.status(404).send("No products found for the given IDs");
      }

      // Calculate total price
      const totalPrice = products.reduce(
        (sum, product) => sum + (product.price || 0),
        0
      );

      if (totalPrice === userTotalPrice) {
        // Send email notification
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER, // Use environment variable
            pass: process.env.EMAIL_PASS, // Use environment variable
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: "Price Match Notification",
          text: `The total price of the products matches your entered total of $${userTotalPrice}.`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
          message: "Total price matches and email sent",
          products,
          totalPrice,
        });
      }

      res.status(200).json({
        message: "Total price does not match",
        products,
        totalPrice,
      });
    } catch (err) {
      console.error("Error verifying total price:", err);
      res.status(500).send("Error verifying total price");
    }
  });

  return router;
};
