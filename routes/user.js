const express = require("express");
const bcrypt = require("bcrypt");
const dbConnection = require("../dbConnection");
const authenticateToken = require("../middleware/authenticateToken");

const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}


// Get all users (admin usage)
router.get("/", (req, res) => {
  dbConnection.query("SELECT User_ID, First_Name, Last_Name, Email, Phone_Number FROM User", (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong!" });
    res.json(result);
  });
});

// Get current user profile
router.get("/me", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  dbConnection.query(
    "SELECT User_ID, First_Name, Last_Name, Email, Phone_Number FROM User WHERE User_ID = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(result[0]);
    }
  );
});

// Register new user
router.post("/register", async (req, res) => {
  const { First_Name, Last_Name, Email, Password, Phone_Number } = req.body;

  if (!Email || !Password || !First_Name || !Last_Name) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    dbConnection.query(
      "INSERT INTO User (First_Name, Last_Name, Email, Password, Phone_Number) VALUES (?, ?, ?, ?, ?)",
      [First_Name, Last_Name, Email.toLowerCase(), hashedPassword, Phone_Number],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email already registered." });
          }
          return res.status(500).json({ message: "Something went wrong!" });
        }
        res.status(201).json({ message: "User registered successfully!" });
      }
    );
  } catch (hashError) {
    console.error(hashError);
    res.status(500).json({ message: "Error processing registration." });
  }
});

// Login
router.post("/login", (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  dbConnection.query("SELECT * FROM User WHERE Email = ?", [Email.toLowerCase()], async (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong!" });
    if (result.length === 0) return res.status(401).json({ message: "Invalid email or password!" });

    const user = result[0];

    try {
      const match = await bcrypt.compare(Password, user.Password);
      if (!match) return res.status(401).json({ message: "Invalid email or password!" });

      const token = jwt.sign(
        { userId: user.User_ID, email: user.Email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      delete user.Password;
      res.json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error during login." });
    }
  });
});

// Update user profile
router.put("/me", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { First_Name, Last_Name, Email, Password, Phone_Number } = req.body;

  try {
    let query, params;

    if (Password) {
      const hashedPassword = await bcrypt.hash(Password, 10);
      query = `
        UPDATE User
        SET First_Name = ?, Last_Name = ?, Email = ?, Password = ?, Phone_Number = ?
        WHERE User_ID = ?
      `;
      params = [First_Name, Last_Name, Email.toLowerCase(), hashedPassword, Phone_Number, userId];
    } else {
      query = `
        UPDATE User
        SET First_Name = ?, Last_Name = ?, Email = ?, Phone_Number = ?
        WHERE User_ID = ?
      `;
      params = [First_Name, Last_Name, Email.toLowerCase(), Phone_Number, userId];
    }

    dbConnection.query(query, params, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong!" });
      }
      res.status(200).json({ message: "User updated successfully!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user." });
  }
});

// Delete user
router.delete("/:userId", (req, res) => {
  const { userId } = req.params;
  dbConnection.query("DELETE FROM User WHERE User_ID = ?", [userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong!" });
    }
    res.status(200).json({ message: "User deleted successfully!" });
  });
});

module.exports = router;
