
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Store = require("./Store");

const Rating = sequelize.define(
  "Rating",
  {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
  },
  {
    indexes: [
      { unique: true, fields: ["userId", "storeId"] }, 
    ],
  }
);


async function recalcStoreAverage(storeId) {
  const { Rating: RatingModel } = require("../models"); 
  const ratings = await RatingModel.findAll({ where: { storeId } });

  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  await Store.update({ average_rating: avg }, { where: { id: storeId } });
}


Rating.afterCreate(async (rating) => {
  await recalcStoreAverage(rating.storeId);
});

Rating.afterUpdate(async (rating) => {
  await recalcStoreAverage(rating.storeId);
});

Rating.afterDestroy(async (rating) => {
  await recalcStoreAverage(rating.storeId);
});

module.exports = Rating;
