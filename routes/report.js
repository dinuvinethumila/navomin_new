const express = require("express");
const dbConnection = require("../dbConnection");

const router = express.Router();

// Get all reports
router.get("/", (req, res) => {
  dbConnection.query("SELECT * FROM Report", (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to retrieve reports." });
    }
    res.json(result);
  });
});

// Get a specific report by ID
router.get("/:Report_ID", (req, res) => {
  const { Report_ID } = req.params;
  dbConnection.query(
    "SELECT * FROM Report WHERE Report_ID = ?",
    [Report_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to fetch report." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Report not found." });
      }
      res.json(result[0]);
    }
  );
});

// Add a new report
router.post("/", (req, res) => {
  const { Owner_ID, Start_Date, End_Date, Generate_Date, Report_Type } = req.body;

  if (!Owner_ID || !Start_Date || !End_Date || !Generate_Date || !Report_Type) {
    return res.status(400).json({ message: "All fields are required." });
  }

  dbConnection.query(
    "INSERT INTO Report (Owner_ID, Start_Date, End_Date, Generate_Date, Report_Type) VALUES (?, ?, ?, ?, ?)",
    [Owner_ID, Start_Date, End_Date, Generate_Date, Report_Type],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to add report." });
      }
      res.status(201).json({ message: "Report created successfully!", Report_ID: result.insertId });
    }
  );
});

// Update an existing report
router.put("/:Report_ID", (req, res) => {
  const { Report_ID } = req.params;
  const { Owner_ID, Start_Date, End_Date, Generate_Date, Report_Type } = req.body;

  if (!Owner_ID || !Start_Date || !End_Date || !Generate_Date || !Report_Type) {
    return res.status(400).json({ message: "All fields are required." });
  }

  dbConnection.query(
    "UPDATE Report SET Owner_ID = ?, Start_Date = ?, End_Date = ?, Generate_Date = ?, Report_Type = ? WHERE Report_ID = ?",
    [Owner_ID, Start_Date, End_Date, Generate_Date, Report_Type, Report_ID],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to update report." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Report not found." });
      }
      res.status(200).json({ message: "Report updated successfully." });
    }
  );
});

// Delete a report
router.delete("/:Report_ID", (req, res) => {
  const { Report_ID } = req.params;

  dbConnection.query("DELETE FROM Report WHERE Report_ID = ?", [Report_ID], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Failed to delete report." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found." });
    }
    res.status(200).json({ message: "Report deleted successfully." });
  });
});

module.exports = router;
