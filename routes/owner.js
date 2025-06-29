const express = require("express");
const dbConnection = require("../dbConnection");
const bcrypt = require("bcrypt");
const router = express.Router();

// Get all owners
router.get("/all", (req, res) => {
  dbConnection.query("SELECT Owner_ID, Name, Email, Phone_Number FROM Owner", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch owners." });
    }
    res.json(result);
  });
});

// Owner login with hashed password check
router.post("/login", (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password are required." });
  }

  dbConnection.query("SELECT * FROM Owner WHERE Email = ?", [Email], async (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Login failed." });
    }
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const owner = result[0];
    const valid = await bcrypt.compare(Password, owner.Password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    delete owner.Password;
    res.json(owner);
  });
});

// Get owner by ID
router.get("/id/:Owner_ID", (req, res) => {
  const { Owner_ID } = req.params;
  dbConnection.query("SELECT Owner_ID, Name, Email, Phone_Number FROM Owner WHERE Owner_ID = ?", [Owner_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch owner." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Owner not found." });
    }
    res.json(result[0]);
  });
});

// Add a new owner with hashed password
router.post("/", async (req, res) => {
  const { Name, Email, Phone_Number, Password } = req.body;

  if (!Name || !Email || !Password) {
    return res.status(400).json({ message: "Name, Email, and Password are required." });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
  dbConnection.query(
    "INSERT INTO Owner (Name, Email, Phone_Number, Password) VALUES (?, ?, ?, ?)",
    [Name, Email, Phone_Number, hashedPassword],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add owner." });
      }
      res.status(201).json({ message: "Owner added successfully.", Owner_ID: result.insertId });
    }
  );
});

// Update owner
router.put("/:Owner_ID", async (req, res) => {
  const { Owner_ID } = req.params;
  const { Name, Email, Phone_Number, Password } = req.body;

  if (!Name || !Email) {
    return res.status(400).json({ message: "Name and Email are required." });
  }

  let updateQuery;
  let params;

  if (Password) {
    const hashedPassword = await bcrypt.hash(Password, 10);
    updateQuery = "UPDATE Owner SET Name = ?, Email = ?, Phone_Number = ?, Password = ? WHERE Owner_ID = ?";
    params = [Name, Email, Phone_Number, hashedPassword, Owner_ID];
  } else {
    updateQuery = "UPDATE Owner SET Name = ?, Email = ?, Phone_Number = ? WHERE Owner_ID = ?";
    params = [Name, Email, Phone_Number, Owner_ID];
  }

  dbConnection.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to update owner." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Owner not found." });
    }
    res.status(200).json({ message: "Owner updated successfully." });
  });
});

// Delete owner
router.delete("/:Owner_ID", (req, res) => {
  const { Owner_ID } = req.params;
  dbConnection.query("DELETE FROM Owner WHERE Owner_ID = ?", [Owner_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete owner." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Owner not found." });
    }
    res.status(200).json({ message: "Owner deleted successfully." });
  });
});

// Get total combined sales from order_item and pre_order_item
router.get("/totalSales", (req, res) => {
  dbConnection.query(
    `SELECT SUM(TOTAL_SALES) AS TOTAL_SALES
     FROM (
       SELECT SUM(S1.Price * O.Quantity) AS TOTAL_SALES
       FROM Order_Item O
       JOIN Product_Size S1 ON O.Product_ID = S1.Product_ID AND O.Size_ID = S1.Size_ID

       UNION ALL

       SELECT SUM(S2.Price * P.Quantity) AS TOTAL_SALES
       FROM Pre_Order_Item P
       JOIN Product_Size S2 ON P.Product_ID = S2.Product_ID AND P.Size_ID = S2.Size_ID
     ) AS DATA`,
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to calculate total sales." });
      }
      res.json(result[0]);
    }
  );
});

// Order sales only
router.get("/orderSales", (req, res) => {
  dbConnection.query(
    `SELECT SUM(S1.Price * O.Quantity) AS TOTAL_SALES
     FROM Order_Item O
     JOIN Product_Size S1 ON O.Product_ID = S1.Product_ID AND O.Size_ID = S1.Size_ID`,
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to calculate order sales." });
      }
      res.json(result[0]);
    }
  );
});

// Pre-order sales only
router.get("/preOrderSales", (req, res) => {
  dbConnection.query(
    `SELECT SUM(S2.Price * P.Quantity) AS TOTAL_SALES
     FROM Pre_Order_Item P
     JOIN Product_Size S2 ON P.Product_ID = S2.Product_ID AND P.Size_ID = S2.Size_ID`,
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to calculate pre-order sales." });
      }
      res.json(result[0]);
    }
  );
});

module.exports = router;
