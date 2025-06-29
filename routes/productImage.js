const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all product images
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Product_Image", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to retrieve product images." });
    }
    res.json(result);
  });
});

// Get images by Product_ID
router.get("/:Product_ID", (req, res) => {
  const { Product_ID } = req.params;

  dbConnection.query(
    "SELECT * FROM Product_Image WHERE Product_ID = ?",
    [Product_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to retrieve images." });
      }
      res.json(result);
    }
  );
});

// Add a product image
router.post("/", (req, res) => {
  const { Product_ID, Image_Link } = req.body;

  if (!Product_ID || !Image_Link) {
    return res.status(400).json({ message: "Product_ID and Image_Link are required." });
  }

  dbConnection.query(
    "INSERT INTO Product_Image (Product_ID, Image_Link) VALUES (?, ?)",
    [Product_ID, Image_Link],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add image." });
      }
      res.status(201).json({ message: "Product image added successfully!", Image_ID: result.insertId });
    }
  );
});

// Update a product image by Image_ID
router.put("/:Image_ID", (req, res) => {
  const { Image_ID } = req.params;
  const { Product_ID, Image_Link } = req.body;

  if (!Product_ID || !Image_Link) {
    return res.status(400).json({ message: "Product_ID and Image_Link are required." });
  }

  dbConnection.query(
    "UPDATE Product_Image SET Product_ID = ?, Image_Link = ? WHERE Image_ID = ?",
    [Product_ID, Image_Link, Image_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update image." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Image not found." });
      }
      res.status(200).json({ message: "Product image updated successfully." });
    }
  );
});

router.delete("/:Product_ID", (req, res) => {
  const { Product_ID } = req.params;

  dbConnection.query(
    "DELETE FROM Product_Image WHERE Product_ID = ?",
    [Product_ID],
    (err, result) => {
      if (err) {
        console.error("Error deleting product image:", err);
        return res.status(500).json({ message: "Failed to delete product image." });
      }
      res.status(200).json({ message: "Image(s) deleted successfully." });
    }
  );
});

module.exports = router;
