const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all order items
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Order_Item", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch order items." });
    }
    res.json(result);
  });
});

router.get("/orderItem/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;
  db.query("SELECT * FROM order_item WHERE Order_ID = ?", [Order_ID], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch order items." });
    res.json(result);
  });
});

// Get order items by Order_ID
router.get("/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;

  dbConnection.query("SELECT * FROM Order_Item WHERE Order_ID = ?", [Order_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch items for this order." });
    }
    res.json(result);
  });
});

// Add a new order item
router.post("/", (req, res) => {
  const { Order_ID, Product_ID, Size_ID, Quantity } = req.body;

  if (!Order_ID || !Product_ID || !Size_ID || !Quantity) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // ✅ Step 1: Check stock
  dbConnection.query(
    "SELECT Stock FROM Product_Size WHERE Size_ID = ?",
    [Size_ID],
    (err, stockResult) => {
      if (err || stockResult.length === 0) {
        return res.status(400).json({ message: "Invalid product size or DB error." });
      }

      const currentStock = stockResult[0].Stock;
      if (Quantity > currentStock) {
        return res.status(400).json({ message: "Not enough stock available." });
      }

      // ✅ Step 2: Insert order item with total amount
      const insertQuery = `
        INSERT INTO Order_Item (Order_ID, Product_ID, Size_ID, Quantity, Total_Amount)
        SELECT ?, ?, ?, ?, Price * ? FROM Product_Size WHERE Size_ID = ?
      `;

      dbConnection.query(
        insertQuery,
        [Order_ID, Product_ID, Size_ID, Quantity, Quantity, Size_ID],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("DB Error [Insert Order_Item]:", insertErr);
            return res.status(500).json({ message: "Failed to add order item." });
          }

          // ✅ Step 3: Reduce stock
          dbConnection.query(
            "UPDATE Product_Size SET Stock = Stock - ? WHERE Size_ID = ?",
            [Quantity, Size_ID],
            (updateErr) => {
              if (updateErr) {
                console.error("DB Error [Update Stock]:", updateErr);
                return res.status(500).json({
                  message: "Order item added, but stock update failed.",
                });
              }

              return res
                .status(201)
                .json({ message: "Order item added and stock updated." });
            }
          );
        }
      );
    }
  );
});

// Update an order item
router.put("/:OrderItem_ID", (req, res) => {
  const { OrderItem_ID } = req.params;
  const { Order_ID, Product_ID, Size_ID, Quantity } = req.body;

  if (!Order_ID || !Product_ID || !Size_ID || Quantity == null) {
    return res.status(400).json({ message: "Order_ID, Product_ID, Size_ID, and Quantity are required." });
  }

  dbConnection.query(
    "UPDATE Order_Item SET Order_ID = ?, Product_ID = ?, Size_ID = ?, Quantity = ? WHERE OrderItem_ID = ?",
    [Order_ID, Product_ID, Size_ID, Quantity, OrderItem_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update order item." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order item not found." });
      }
      res.json({ message: "Order item updated successfully." });
    }
  );
});



// Delete an order item
router.delete("/:OrderItem_ID", (req, res) => {
  const { OrderItem_ID } = req.params;

  dbConnection.query("DELETE FROM Order_Item WHERE OrderItem_ID = ?", [OrderItem_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete order item." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order item not found." });
    }
    res.status(200).json({ message: "Order item deleted successfully." });
  });
});

module.exports = router;
