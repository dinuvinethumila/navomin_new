const mysql = require("mysql2");
require("dotenv").config();

const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "navomin_super",
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD),
  },
});

dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: ", err);
  } else {
    console.log("Connected to database!");
  }
});

module.exports = dbConnection;
