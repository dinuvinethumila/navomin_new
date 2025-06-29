const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all product sizes
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Product_Size", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch product sizes." });
    }
    res.json(result);
  });
});

// Get sizes for a specific product
router.get("/:Product_ID", (req, res) => {
  const { Product_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM Product_Size WHERE Product_ID = ?",
    [Product_ID],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch sizes for product." });
      }
      res.json(result);
    }
  );
});

// Get a specific size by Size_ID
router.get("/size/:Size_ID", (req, res) => {
  const { Size_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM Product_Size WHERE Size_ID = ?",
    [Size_ID],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch product size." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Size not found." });
      }
      res.json(result[0]);
    }
  );
});

// Add a new product size
router.post("/", (req, res) => {
  const { Product_ID, Price, Size, Stock } = req.body;

  if (!Product_ID || Price == null || !Size || Stock == null) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  dbConnection.query(
    "INSERT INTO Product_Size (Product_ID, Price, Size, Stock) VALUES (?, ?, ?, ?)",
    [Product_ID, Price, Size, Stock],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to add product size." });
      }
      res.status(201).json({ message: "Product size added successfully!", Size_ID: result.insertId });
    }
  );
});

// Update stock for a specific size
router.put("/stock/:Size_ID", (req, res) => {
  const { Size_ID } = req.params;
  const { Stock } = req.body;

  if (Stock == null) {
    return res.status(400).json({ message: "Stock value is required." });
  }

  dbConnection.query(
    "UPDATE Product_Size SET Stock = ? WHERE Size_ID = ?",
    [Stock, Size_ID],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update stock." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Size not found." });
      }
      res.status(200).json({ message: "Stock updated successfully." });
    }
  );
});

// Delete a product size
router.delete("/:Size_ID", (req, res) => {
  const { Size_ID } = req.params;

  dbConnection.query(
    "DELETE FROM Product_Size WHERE Size_ID = ?",
    [Size_ID],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete product size." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Size not found." });
      }
      res.status(200).json({ message: "Product size deleted successfully." });
    }
  );
});

module.exports = router;
