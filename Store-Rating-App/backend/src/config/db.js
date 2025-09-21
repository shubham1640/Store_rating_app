
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DB:", process.env.DATABASE_URL);
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();

module.exports = sequelize; 
