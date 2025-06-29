const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM credit_profile", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Something went wrong!");
    } else {
      res.json(result);
    }
  });
});

router.get("/:CreditProfile_ID", (req, res) => {
  const { CreditProfile_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM credit_profile WHERE CreditProfile_ID = ?",
    [CreditProfile_ID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
      } else {
        res.json(result[0]);
      }
    }
  );
});

router.post("/", (req, res) => {
  const { User_ID, Balance, Customer_Name, Phone_Number, Reminder_Sent } =
    req.body;
  dbConnection.query(
    "INSERT INTO credit_profile (User_ID, Balance, Customer_Name, Phone_Number, Reminder_Sent) VALUES (?, ?, ?, ?, ?)",
    [User_ID, Balance, Customer_Name, Phone_Number, Reminder_Sent],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
      } else {
        res.status(201).send("Credit profile added successfully!");
      }
    }
  );
});

router.put("/:CreditProfile_ID", (req, res) => {
  const { CreditProfile_ID } = req.params;
  const { Balance, Customer_Name, Phone_Number, Reminder_Sent } =
    req.body;
  dbConnection.query(
    "UPDATE credit_profile SET Balance = ?, Customer_Name = ?, Phone_Number = ?, Reminder_Sent = ? WHERE CreditProfile_ID = ?",
    [
      Balance,
      Customer_Name,
      Phone_Number,
      Reminder_Sent,
      CreditProfile_ID,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
      } else {
        res.status(200).send("Credit profile updated successfully!");
      }
    }
  );
});

router.delete("/:CreditProfile_ID", (req, res) => {
  const { CreditProfile_ID } = req.params;
  dbConnection.query(
    "DELETE FROM credit_profile WHERE CreditProfile_ID = ?",
    [CreditProfile_ID],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
      } else {
        res.status(200).send("Credit profile deleted successfully!");
      }
    }
  );
});

module.exports = router;