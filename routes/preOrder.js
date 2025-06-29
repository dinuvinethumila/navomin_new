const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all pre-orders
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Pre_Order", (err, result) => {
    if (err) {
      console.error("DB Error [GET /preOrder]:", err);
      return res.status(500).json({ message: "Failed to fetch pre-orders." });
    }
    res.json(result);
  });
});

// Get a specific pre-order by ID
router.get("/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM Pre_Order WHERE Pre_Order_ID = ?",
    [Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [GET /preOrder/:Pre_Order_ID]:", err);
        return res.status(500).json({ message: "Failed to fetch pre-order." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Pre-order not found." });
      }
      res.json(result[0]);
    }
  );
});

// Get all pre-orders for a specific user
router.get("/user/:User_ID", (req, res) => {
  const { User_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM Pre_Order WHERE User_ID = ?",
    [User_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [GET /preOrder/user/:User_ID]:", err);
        return res.status(500).json({ message: "Failed to fetch user's pre-orders." });
      }
      res.json(result);
    }
  );
});

// Create a new pre-order
router.post("/", (req, res) => {
  const { User_ID, Half_Paid, Estimated_Total, Pickup_Date, Pickup_Time } = req.body;

  if (!User_ID || Estimated_Total == null || !Pickup_Date || !Pickup_Time) {
    return res.status(400).json({
      message: "User_ID, Estimated_Total, Pickup_Date, and Pickup_Time are required.",
    });
  }

  const halfPaidValue = Half_Paid === "Paid" ? "Paid" : "Unpaid";

  dbConnection.query(
    "INSERT INTO Pre_Order (User_ID, Half_Paid, Estimated_Total, Pickup_Date, Pickup_Time, Status) VALUES (?, ?, ?, ?, ?, ?)",
    [User_ID, halfPaidValue, Estimated_Total, Pickup_Date, Pickup_Time, "Pending"],
    (err, result) => {
      if (err) {
        console.error("DB Error [POST /preOrder]:", err);
        return res.status(500).json({ message: "Failed to create pre-order." });
      }
      res.status(201).json({
        message: "Pre-order created successfully.",
        Pre_Order_ID: result.insertId,
      });
    }
  );
});

// Update pre-order details
router.put("/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;
  const { Half_Paid, Estimated_Total, Pickup_Date, Pickup_Time } = req.body;

  if (Estimated_Total == null || !Pickup_Date || !Pickup_Time) {
    return res.status(400).json({
      message: "Estimated_Total, Pickup_Date, and Pickup_Time are required.",
    });
  }

  const halfPaidValue = Half_Paid === "Paid" ? "Paid" : "Unpaid";

  dbConnection.query(
    "UPDATE Pre_Order SET Half_Paid = ?, Estimated_Total = ?, Pickup_Date = ?, Pickup_Time = ? WHERE Pre_Order_ID = ?",
    [halfPaidValue, Estimated_Total, Pickup_Date, Pickup_Time, Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /preOrder/:id]:", err);
        return res.status(500).json({ message: "Failed to update pre-order." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order not found." });
      }
      res.json({ message: "Pre-order updated successfully." });
    }
  );
});

// Update only status
router.put("/status/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;
  const { Status } = req.body;

  if (!Status) {
    return res.status(400).json({ message: "Status is required." });
  }

  dbConnection.query(
    "UPDATE Pre_Order SET Status = ? WHERE Pre_Order_ID = ?",
    [Status, Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /preOrder/status/:id]:", err);
        return res.status(500).json({ message: "Failed to update pre-order status." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order not found." });
      }
      res.json({ message: "Pre-order status updated successfully." });
    }
  );
});

// Update only Half_Paid (e.g., after mock or real payment)
router.put("/payment/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;
  const { Half_Paid } = req.body;

  if (!Half_Paid) {
    return res.status(400).json({ message: "Half_Paid is required." });
  }

  const halfPaidValue = Half_Paid === "Paid" ? "Paid" : "Paid";

  dbConnection.query(
    "UPDATE Pre_Order SET Half_Paid = ? WHERE Pre_Order_ID = ?",
    [halfPaidValue, Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /preOrder/payment/:id]:", err);
        return res.status(500).json({ message: "Failed to update payment status." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order not found." });
      }
      res.json({ message: "Pre-order payment status updated to Paid." });
    }
  );
});

// Update only estimated price
router.put("/estiPrice/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;
  const { Estimated_Total } = req.body;

  if (Estimated_Total == null) {
    return res.status(400).json({ message: "Estimated_Total is required." });
  }

  dbConnection.query(
    "UPDATE Pre_Order SET Estimated_Total = ? WHERE Pre_Order_ID = ?",
    [Estimated_Total, Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [PUT /preOrder/estiPrice/:id]:", err);
        return res.status(500).json({ message: "Failed to update estimated total." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order not found." });
      }
      res.json({ message: "Estimated total updated successfully." });
    }
  );
});

// Delete a pre-order
router.delete("/:Pre_Order_ID", (req, res) => {
  const { Pre_Order_ID } = req.params;

  dbConnection.query(
    "DELETE FROM Pre_Order WHERE Pre_Order_ID = ?",
    [Pre_Order_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error [DELETE /preOrder/:id]:", err);
        return res.status(500).json({ message: "Failed to delete pre-order." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Pre-order not found." });
      }
      res.json({ message: "Pre-order deleted successfully." });
    }
  );
});

module.exports = router;
