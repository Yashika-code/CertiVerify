import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = [
      {
        name: "Admin User",
        email: "admin@test.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin"
      },
      {
        name: "Verifier User",
        email: "verifier@test.com",
        password: await bcrypt.hash("verifier123", 10),
        role: "verifier"
      }
    ];

    for (const user of users) {
      const exists = await User.findOne({ email: user.email });
      if (!exists) {
        await User.create(user);
        console.log(`✅ ${user.role} created`);
      }
    }

    console.log("🎉 Seeding complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
