const bcrypt = require("bcrypt");
const { sequelize, User, Store, Rating } = require("./models");

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); 

    console.log("✅ Database synced. Seeding...");

  
    const passwordHash = await bcrypt.hash("Password@123", 10);

  
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password_hash: passwordHash,
      address: "Admin Address",
      role: "ADMIN",
    });

    const user1 = await User.create({
      name: "shubham fasate",
      email: "shubhamfasate2@gmail.com",
      password_hash: passwordHash,
      address: "123 route",
      role: "USER",
    });

    const user2 = await User.create({
      name: "shubham ",
      email: "shubham@example.com",
      password_hash: passwordHash,
      address: "456 colony",
      role: "USER",
    });

    const owner1 = await User.create({
      name: "Owner One",
      email: "owner1@example.com",
      password_hash: passwordHash,
      address: "Owner Address ",
      role: "STORE_OWNER",
    });

    const owner2 = await User.create({
      name: "Owner Two",
      email: "owner2@example.com",
      password_hash: passwordHash,
      address: "Owner Address 2",
      role: "STORE_OWNER",
    });

  
    const store1 = await Store.create({
      name: "Rathi book store ",
      email: "rathibooks@example.com",
      address: "abc chauwk",
      ownerId: owner1.id,
    });

    const store2 = await Store.create({
      name: "heaven cafe",
      email: "cafe@example.com",
      address: "101 street ",
      ownerId: owner2.id,
    });

  
    await Rating.create({
      rating: 5,
      userId: user1.id,
      storeId: store1.id,
    });

    await Rating.create({
      rating: 4,
      userId: user2.id,
      storeId: store2.id,
    });

    console.log("✅ Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
