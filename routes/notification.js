const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all notifications
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Notification", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch notifications." });
    }
    res.json(result);
  });
});

// Get notification by ID
router.get("/:Notification_ID", (req, res) => {
  const { Notification_ID } = req.params;

  dbConnection.query("SELECT * FROM Notification WHERE Notification_ID = ?", [Notification_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch notification." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json(result[0]);
  });
});

// Create a new notification
router.post("/", (req, res) => {
  const { User_ID, Owner_ID, Sent_Date, Message, Sent_Time } = req.body;

  if (!User_ID || !Owner_ID || !Sent_Date || !Message || !Sent_Time) {
    return res.status(400).json({ message: "All fields are required." });
  }

  dbConnection.query(
    "INSERT INTO Notification (User_ID, Owner_ID, Sent_Date, Message, Sent_Time) VALUES (?, ?, ?, ?, ?)",
    [User_ID, Owner_ID, Sent_Date, Message, Sent_Time],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add notification." });
      }
      res.status(201).json({ message: "Notification added successfully!", Notification_ID: result.insertId });
    }
  );
});

// Update a notification
router.put("/:Notification_ID", (req, res) => {
  const { Notification_ID } = req.params;
  const { User_ID, Owner_ID, Sent_Date, Message, Sent_Time } = req.body;

  if (!User_ID || !Owner_ID || !Sent_Date || !Message || !Sent_Time) {
    return res.status(400).json({ message: "All fields are required." });
  }

  dbConnection.query(
    "UPDATE Notification SET User_ID = ?, Owner_ID = ?, Sent_Date = ?, Message = ?, Sent_Time = ? WHERE Notification_ID = ?",
    [User_ID, Owner_ID, Sent_Date, Message, Sent_Time, Notification_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update notification." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Notification not found." });
      }
      res.status(200).json({ message: "Notification updated successfully." });
    }
  );
});

// Delete a notification
router.delete("/:Notification_ID", (req, res) => {
  const { Notification_ID } = req.params;

  dbConnection.query("DELETE FROM Notification WHERE Notification_ID = ?", [Notification_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete notification." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.status(200).json({ message: "Notification deleted successfully." });
  });
});

module.exports = router;
