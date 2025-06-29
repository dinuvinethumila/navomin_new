const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all orders
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Order_Table", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch orders." });
    }
    res.json(result);
  });
});

// Get order by ID
router.get("/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;

  dbConnection.query("SELECT * FROM Order_Table WHERE Order_ID = ?", [Order_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch order." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(result[0]);
  });
});

// Get orders by user
router.get("/user/:User_ID", (req, res) => {
  const { User_ID } = req.params;

  dbConnection.query("SELECT * FROM Order_Table WHERE User_ID = ?", [User_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch user's orders." });
    }
    res.json(result);
  });
});


// Create a new order
router.post("/", (req, res) => {
  const { User_ID, Pickup_Time, Status, Total_Amount } = req.body;

  if (!User_ID || !Pickup_Time || Total_Amount == null) {
    return res.status(400).json({ message: "User_ID, Pickup_Time, and Total_Amount are required." });
  }

  const finalStatus = Status || "Pending";

  dbConnection.query(
    "INSERT INTO Order_Table (User_ID, Pickup_Time, Status, Total_Amount, Payment_Status) VALUES (?, ?, ?, ?, 'Unpaid')",
    [User_ID, Pickup_Time, finalStatus, Total_Amount],
    (err, result) => {
       if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to create order." });
      }
      res.status(201).json({ message: "Order created successfully.", Order_ID: result.insertId });
    }
  );
});


// Update order details
router.put("/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;
  const { User_ID, Pickup_Time, Status, Total_Amount } = req.body;

  if (!User_ID || !Pickup_Time || !Status || Total_Amount == null) {
    return res.status(400).json({ message: "All fields are required." });
  }

  dbConnection.query(
    "UPDATE Order_Table SET User_ID = ?, Pickup_Time = ?, Status = ?, Total_Amount = ? WHERE Order_ID = ?",
    [User_ID, Pickup_Time, Status, Total_Amount, Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update order." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found." });
      }
      res.json({ message: "Order updated successfully." });
    }
  );
});

// Update status only
router.put("/status/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;
  const { Status } = req.body;

  if (!Status) {
    return res.status(400).json({ message: "Status is required." });
  }

  dbConnection.query("UPDATE Order_Table SET Status = ? WHERE Order_ID = ?", [Status, Order_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to update order status." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json({ message: "Order status updated successfully." });
  });
});

// Delete order
router.delete("/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;

  dbConnection.query("DELETE FROM Order_Table WHERE Order_ID = ?", [Order_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete order." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json({ message: "Order deleted successfully." });
  });
});

// ✅ Update payment status for a normal order
router.put("/payment/:Order_ID", (req, res) => {
  const { Order_ID } = req.params;
  const { Payment_Status } = req.body;

  if (!Payment_Status) {
    return res.status(400).json({ message: "Payment_Status is required." });
  }

  dbConnection.query(
    "UPDATE Order_Table SET Payment_Status = ? WHERE Order_ID = ?",
    [Payment_Status, Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /order/payment]:", err);
        return res.status(500).json({ message: "Failed to update payment status." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found." });
      }
      res.status(200).json({ message: "Payment status updated successfully." });
    }
  );
});


module.exports = router;
