const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all pre-order items
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Pre_Order_Item", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch pre-order items." });
    }
    res.json(result);
  });
});

// Get items by Pre_Order_ID
router.get("/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;

  dbConnection.query(
    "SELECT * FROM Pre_Order_Item WHERE Pre_Order_ID = ?",
    [Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to fetch pre-order items." });
      }
      res.json(result);
    }
  );
});

// Add a pre-order item
router.post("/", (req, res) => {
  const { Pre_Order_ID, Ingredients, Product_ID, Size_ID, Quantity } = req.body;

  if (!Pre_Order_ID || !Product_ID || !Size_ID || !Quantity) {
    return res.status(400).json({
      message: "Pre_Order_ID, Product_ID, Size_ID, and Quantity are required.",
    });
  }

  dbConnection.query(
    "INSERT INTO Pre_Order_Item (Pre_Order_ID, Ingredients, Product_ID, Size_ID, Quantity) VALUES (?, ?, ?, ?, ?)",
    [Pre_Order_ID, Ingredients || null, Product_ID, Size_ID, Quantity],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add pre-order item." });
      }
      res.status(201).json({ message: "Pre-order item added successfully!", Pre_Order_Item_ID: result.insertId });
    }
  );
});

// Update a pre-order item
router.put("/:Pre_Order_Item_ID", (req, res) => {
  const { Pre_Order_Item_ID } = req.params;
  const { Pre_Order_ID, Ingredients, Product_ID, Size_ID, Quantity } = req.body;

  if (!Pre_Order_ID || !Product_ID || !Size_ID || !Quantity) {
    return res.status(400).json({
      message: "Pre_Order_ID, Product_ID, Size_ID, and Quantity are required.",
    });
  }

  dbConnection.query(
    `UPDATE Pre_Order_Item 
     SET Pre_Order_ID = ?, Ingredients = ?, Product_ID = ?, Size_ID = ?, Quantity = ?
     WHERE Pre_Order_Item_ID = ?`,
    [Pre_Order_ID, Ingredients || null, Product_ID, Size_ID, Quantity, Pre_Order_Item_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update pre-order item." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order item not found." });
      }
      res.status(200).json({ message: "Pre-order item updated successfully." });
    }
  );
});

// Delete a pre-order item
router.delete("/:Pre_Order_Item_ID", (req, res) => {
  const { Pre_Order_Item_ID } = req.params;

  dbConnection.query(
    "DELETE FROM Pre_Order_Item WHERE Pre_Order_Item_ID = ?",
    [Pre_Order_Item_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to delete pre-order item." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order item not found." });
      }
      res.status(200).json({ message: "Pre-order item deleted successfully." });
    }
  );
});

module.exports = router;
