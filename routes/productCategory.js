const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all product categories
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Product_Category", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to retrieve product categories." });
    }
    res.json(result);
  });
});

// Get a specific product category by ID
router.get("/:ProductCategory_ID", (req, res) => {
  const { ProductCategory_ID } = req.params;

  dbConnection.query(
    "SELECT * FROM Product_Category WHERE ProductCategory_ID = ?",
    [ProductCategory_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to retrieve product category." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Product category not found." });
      }
      res.json(result[0]);
    }
  );
});

// Add a new product category
router.post("/", (req, res) => {
  const { Category_ID, ProductCategory_Name } = req.body;

  if (!Category_ID || !ProductCategory_Name) {
    return res.status(400).json({ message: "Category_ID and ProductCategory_Name are required." });
  }

  dbConnection.query(
    "INSERT INTO Product_Category (Category_ID, ProductCategory_Name) VALUES (?, ?)",
    [Category_ID, ProductCategory_Name],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add product category." });
      }
      res.status(201).json({ message: "Product category added successfully!", ProductCategory_ID: result.insertId });
    }
  );
});

// Update a product category
router.put("/:ProductCategory_ID", (req, res) => {
  const { ProductCategory_ID } = req.params;
  const { Category_ID, ProductCategory_Name } = req.body;

  if (!Category_ID || !ProductCategory_Name) {
    return res.status(400).json({ message: "Both Category_ID and ProductCategory_Name are required." });
  }

  dbConnection.query(
    "UPDATE Product_Category SET Category_ID = ?, ProductCategory_Name = ? WHERE ProductCategory_ID = ?",
    [Category_ID, ProductCategory_Name, ProductCategory_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update product category." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product category not found." });
      }
      res.status(200).json({ message: "Product category updated successfully." });
    }
  );
});

// Delete a product category
router.delete("/:ProductCategory_ID", (req, res) => {
  const { ProductCategory_ID } = req.params;

  dbConnection.query(
    "DELETE FROM Product_Category WHERE ProductCategory_ID = ?",
    [ProductCategory_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to delete product category." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product category not found." });
      }
      res.status(200).json({ message: "Product category deleted successfully." });
    }
  );
});

module.exports = router;
