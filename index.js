const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authenticateToken = require("./middleware/authenticateToken.js"); // Keep this import here


const app = express();

app.use(express.json());
app.use(cors());

// Route imports
app.use("/api/user", require("./routes/user"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/cartItem", require("./routes/cartItem"));
app.use("/api/category", require("./routes/category"));
app.use("/api/notification", require("./routes/notification"));
app.use("/api/preorder", require("./routes/preorder"));
app.use("/api/preOrderItem", require("./routes/preOrderItem"));
app.use("/api/creditProfile", require("./routes/creditProfile"));
app.use("/api/product", require("./routes/product"));
app.use("/api/productSize", require("./routes/productSize"));
app.use("/api/productImage", require("./routes/productImage"));
app.use("/api/productCategory", require("./routes/productCategory"));
app.use("/api/orderItem", require("./routes/orderItem"));
app.use("/api/owner", require("./routes/owner"));
app.use("/api/report", require("./routes/report"));
app.use("/api/order", require("./routes/orderTable")); // No need to duplicate authenticateToken here
app.use("/api/invoice", require("./routes/invoice"));
app.use("/api/invoices", express.static("invoices")); // serve static PDFs

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
