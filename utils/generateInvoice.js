const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (order, type = "normal") => {
  const doc = new PDFDocument();
  const filename = `invoice_${type}_${order.id}.pdf`;
  const filepath = path.join("invoices", filename);

  // Create write stream to save PDF
  doc.pipe(fs.createWriteStream(filepath));

  // Header
  doc.fontSize(20).text("Navomin Super Invoice", { align: "center" });
  doc.moveDown();

  // Order Info
  doc.fontSize(14).text(`Order ID: ${order.id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Customer: ${order.customerName}`);
  doc.text(`Type: ${type}`);
  doc.moveDown();

  // Item List
  doc.text("Items:");
  order.items.forEach((item, i) => {
    doc.text(`${i + 1}. ${item.Product_Name} (${item.Size}) x${item.Quantity} — Rs. ${item.Price}`);
  });

  doc.moveDown();
  doc.text(`Total: Rs. ${order.total}`, { align: "right" });

  doc.end();

  return filepath;
};

module.exports = { generateInvoice };
