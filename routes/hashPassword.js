// hashPassword.js
const bcrypt = require("bcrypt");

const password = "admin123"; // 🔒 Change this to your desired password

bcrypt.hash(password, 10).then((hash) => {
  console.log("Hashed password:", hash);
});
