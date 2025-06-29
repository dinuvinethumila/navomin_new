const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// ✅ Get all cart items
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Cart_Item", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch cart items." });
    }
    return res.json(result);
  });
});

// ✅ Get items for a specific cart
router.get("/:Cart_ID", (req, res) => {
  const { Cart_ID } = req.params;

  dbConnection.query("SELECT * FROM Cart_Item WHERE Cart_ID = ?", [Cart_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch items for this cart." });
    }
    return res.json(result);
  });
});

// ✅ Add item to cart with total stock validation
router.post("/", (req, res) => {
  const { Cart_ID, Size_ID, Quantity, Product_ID, Category_ID } = req.body;

  if (!Cart_ID || !Size_ID || !Quantity || !Product_ID || !Category_ID) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Step 1: Get current stock
  dbConnection.query(
    "SELECT Stock FROM Product_Size WHERE Size_ID = ?",
    [Size_ID],
    (errStock, stockResult) => {
      if (errStock || stockResult.length === 0) {
        console.error("Stock lookup error:", errStock);
        return res.status(500).json({ message: "Failed to retrieve stock info." });
      }

      const stockAvailable = stockResult[0].Stock;

      // Step 2: Check if item already exists in cart
      dbConnection.query(
        "SELECT Cart_Item_ID, Quantity FROM Cart_Item WHERE Cart_ID = ? AND Product_ID = ? AND Size_ID = ?",
        [Cart_ID, Product_ID, Size_ID],
        (errCart, cartResult) => {
          if (errCart) {
            console.error("Cart query error:", errCart);
            return res.status(500).json({ message: "Failed to check existing cart item." });
          }

          const existing = cartResult[0];
          const existingQty = existing ? existing.Quantity : 0;
          const totalQty = existingQty + Quantity;

          if (totalQty > stockAvailable) {
            return res.status(400).json({
              message: `Stock exceeded. Only ${stockAvailable} units available. You already have ${existingQty} in the cart.`,
            });
          }

          // Step 3: Update or insert
          if (existing) {
            dbConnection.query(
              "UPDATE Cart_Item SET Quantity = ? WHERE Cart_Item_ID = ?",
              [totalQty, existing.Cart_Item_ID],
              (errUpdate) => {
                if (errUpdate) {
                  console.error("Update failed:", errUpdate);
                  return res.status(500).json({ message: "Failed to update cart item." });
                }
                return res.status(200).json({ message: "Cart item updated successfully." });
              }
            );
          } else {
            dbConnection.query(
              "INSERT INTO Cart_Item (Cart_ID, Size_ID, Quantity, Product_ID, Category_ID) VALUES (?, ?, ?, ?, ?)",
              [Cart_ID, Size_ID, Quantity, Product_ID, Category_ID],
              (errInsert, resultInsert) => {
                if (errInsert) {
                  console.error("Insert failed:", errInsert);
                  return res.status(500).json({ message: "Failed to add to cart." });
                }
                return res.status(201).json({
                  message: "Cart item added successfully.",
                  Cart_Item_ID: resultInsert.insertId,
                });
              }
            );
          }
        }
      );
    }
  );
});

// ✅ Update cart item directly
router.put("/:Cart_Item_ID", (req, res) => {
  const { Cart_Item_ID } = req.params;
  const { Cart_ID, Quantity, Product_ID, Size_ID, Category_ID } = req.body;

  if (!Cart_ID || !Quantity || !Product_ID || !Size_ID || !Category_ID) {
    return res.status(400).json({ message: "All fields are required." });
  }

  dbConnection.query(
    "UPDATE Cart_Item SET Cart_ID = ?, Quantity = ?, Product_ID = ?, Size_ID = ?, Category_ID = ? WHERE Cart_Item_ID = ?",
    [Cart_ID, Quantity, Product_ID, Size_ID, Category_ID, Cart_Item_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update cart item." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart item not found." });
      }
      return res.status(200).json({ message: "Cart item updated successfully." });
    }
  );
});

// ✅ Delete cart item
router.delete("/:Cart_Item_ID", (req, res) => {
  const { Cart_Item_ID } = req.params;

  dbConnection.query("DELETE FROM Cart_Item WHERE Cart_Item_ID = ?", [Cart_Item_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete cart item." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }
    return res.status(200).json({ message: "Cart item deleted successfully." });
  });
});

module.exports = router;
