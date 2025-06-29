const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

/**
 * =========================
 * ADMIN ROUTES (KEEPING AS IS)
 * =========================
 */

// Get all carts (admin/debug)
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Cart", (err, result) => {
    if (err) {
      console.error("DB Error [GET /cart]:", err);
      return res.status(500).json({ message: "Failed to fetch carts." });
    }
    res.json(result);
  });
});

// Disable a cart (set IS_ACTIVE = 0)
router.put("/cartDisable/:Cart_ID", (req, res) => {
  const { Cart_ID } = req.params;

  dbConnection.query(
    "UPDATE Cart SET IS_ACTIVE = 0 WHERE Cart_ID = ?",
    [Cart_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /cart/cartDisable/:Cart_ID]:", err);
        return res.status(500).json({ message: "Failed to disable cart." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart not found." });
      }
      res.status(200).json({ message: "Cart disabled successfully." });
    }
  );
});

// Delete a cart
router.delete("/:Cart_ID", (req, res) => {
  const { Cart_ID } = req.params;

  dbConnection.query(
    "DELETE FROM Cart WHERE Cart_ID = ?",
    [Cart_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [DELETE /cart/:Cart_ID]:", err);
        return res.status(500).json({ message: "Failed to delete cart." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart not found." });
      }
      res.status(200).json({ message: "Cart deleted successfully." });
    }
  );
});

/**
 * =========================
 * CUSTOMER FUNCTIONALITY
 * =========================
 */

// Get all carts for a specific user
router.get("/:User_ID", (req, res) => {
  const { User_ID } = req.params;

  dbConnection.query(
    "SELECT * FROM Cart WHERE User_ID = ?",
    [User_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [GET /cart/:User_ID]:", err);
        return res.status(500).json({ message: "Failed to fetch user's carts." });
      }
      res.json(Array.isArray(result) ? result : []);
    }
  );
});

// Create a new cart for a user
router.post("/", (req, res) => {
  const { User_ID } = req.body;

  if (!User_ID) {
    return res.status(400).json({ message: "User_ID is required." });
  }

  dbConnection.query(
    "INSERT INTO Cart (User_ID) VALUES (?)",
    [User_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [POST /cart]:", err);
        return res.status(500).json({ message: "Failed to create cart." });
      }
      res.status(201).json({
        message: "Cart created successfully.",
        Cart_ID: result.insertId,
      });
    }
  );
});

// Update the User_ID of a specific cart
router.put("/:Cart_ID", (req, res) => {
  const { Cart_ID } = req.params;
  const { User_ID } = req.body;

  if (!User_ID) {
    return res.status(400).json({ message: "User_ID is required." });
  }

  dbConnection.query(
    "UPDATE Cart SET User_ID = ? WHERE Cart_ID = ?",
    [User_ID, Cart_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /cart/:Cart_ID]:", err);
        return res.status(500).json({ message: "Failed to update cart." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Cart not found." });
      }
      res.status(200).json({ message: "Cart updated successfully." });
    }
  );
});

module.exports = router;
