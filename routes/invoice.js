
const path = require("path"); // ✅ CommonJS syntax

const express = require("express");
const { generateInvoice } = require("../utils/generateInvoice");
const router = express.Router();

// POST /invoice/download
router.post("/download", (req, res) => {
  const { order, type } = req.body;

  try {
    const filePath = generateInvoice(order, type);
    const fileName = path.basename(filePath);
    res.json({ filePath: `/invoice/file/${fileName}` });
  } catch (error) {
    console.error("Invoice generation failed:", error);
    res.status(500).json({ message: "Failed to generate invoice." });
  }
});

// GET /invoice/file/:filename
router.get("/file/:filename", (req, res) => {
  const file = path.join("invoices", req.params.filename);
  res.download(file);
});

module.exports = router;
