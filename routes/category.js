const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all categories
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Category", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch categories." });
    }
    res.json(result);
  });
});

// Get category by ID
router.get("/:Category_ID", (req, res) => {
  const { Category_ID } = req.params;

  dbConnection.query("SELECT * FROM Category WHERE Category_ID = ?", [Category_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to fetch category." });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.json(result[0]);
  });
});

// Add a new category
router.post("/", (req, res) => {
  const { Category_Name } = req.body;

  if (!Category_Name) {
    return res.status(400).json({ message: "Category_Name is required." });
  }

  dbConnection.query("INSERT INTO Category (Category_Name) VALUES (?)", [Category_Name], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to add category." });
    }
    res.status(201).json({ message: "Category added successfully!", Category_ID: result.insertId });
  });
});

// Update category
router.put("/:Category_ID", (req, res) => {
  const { Category_ID } = req.params;
  const { Category_Name } = req.body;

  if (!Category_Name) {
    return res.status(400).json({ message: "Category_Name is required." });
  }

  dbConnection.query("UPDATE Category SET Category_Name = ? WHERE Category_ID = ?", [Category_Name, Category_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to update category." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category updated successfully." });
  });
});

// Delete category
router.delete("/:Category_ID", (req, res) => {
  const { Category_ID } = req.params;

  dbConnection.query("DELETE FROM Category WHERE Category_ID = ?", [Category_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete category." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category deleted successfully." });
  });
});

module.exports = router;
