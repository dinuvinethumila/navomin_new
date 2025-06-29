const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all products
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Product", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch products." });
    }
    res.json(result);
  });
});

// Get a specific product by ID
router.get("/:Product_ID", (req, res) => {
  const { Product_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM Product WHERE Product_ID = ?",
    [Product_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to fetch product." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Product not found." });
      }
      res.json(result[0]);
    }
  );
});

// Create a new product
router.post("/", (req, res) => {
  const { Product_ID, ProductCategory_ID, Product_Name, Product_Description } = req.body;

  if (!Product_ID || !ProductCategory_ID || !Product_Name) {
    return res.status(400).json({ message: "Product_ID, ProductCategory_ID, and Product_Name are required." });
  }

  dbConnection.query(
    "INSERT INTO Product (Product_ID, ProductCategory_ID, Product_Name, Product_Description) VALUES (?, ?, ?, ?)",
    [Product_ID, ProductCategory_ID, Product_Name, Product_Description || null],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add product." });
      }
      res.status(201).json({ message: "Product added successfully." });
    }
  );
});

// Update a product
router.put("/:Product_ID", (req, res) => {
  const { Product_ID } = req.params;
  const { ProductCategory_ID, Product_Name, Product_Description } = req.body;

  if (!ProductCategory_ID || !Product_Name) {
    return res.status(400).json({ message: "ProductCategory_ID and Product_Name are required." });
  }

  dbConnection.query(
    "UPDATE Product SET ProductCategory_ID = ?, Product_Name = ?, Product_Description = ? WHERE Product_ID = ?",
    [ProductCategory_ID, Product_Name, Product_Description || null, Product_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update product." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found." });
      }
      res.status(200).json({ message: "Product updated successfully." });
    }
  );
});

// Delete a product
router.delete("/:Product_ID", (req, res) => {
  const { Product_ID } = req.params;

  dbConnection.query("DELETE FROM Product WHERE Product_ID = ?", [Product_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete product." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product deleted successfully." });
  });
});

// Get all products under a specific ProductCategory_ID
router.get("/stock/:ProductCategory_ID", (req, res) => {
  const { ProductCategory_ID } = req.params;

  dbConnection.query(
    "SELECT * FROM Product WHERE ProductCategory_ID = ?",
    [ProductCategory_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to fetch products by category." });
      }
      res.json(result);
    }
  );
});

module.exports = router;
