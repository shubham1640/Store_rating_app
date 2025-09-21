
const sequelize = require("../config/db");
const User = require("./User");
const Store = require("./Store");
const Rating = require("./Rating");





User.hasMany(Rating, { foreignKey: "userId", onDelete: "CASCADE" });
Rating.belongsTo(User, { foreignKey: "userId" });


Store.hasMany(Rating, { foreignKey: "storeId", onDelete: "CASCADE" });
Rating.belongsTo(Store, { foreignKey: "storeId" });


User.hasMany(Store, { foreignKey: "ownerId", as: "OwnedStores" });
Store.belongsTo(User, { foreignKey: "ownerId", as: "Owner" });


sequelize
  .sync({ alter: false }) 
  .then(() => console.log("✅ All models synced with database"))
  .catch((err) => console.error("❌ Error syncing models:", err));

module.exports = { sequelize, User, Store, Rating };
