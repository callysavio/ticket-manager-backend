import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Category from "../models/Category.js";
import dotenv from "dotenv";
dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = [
      {
        name: "Technical Support",
        description: "Technical issues and bugs",
        color: "#EF4444",
        priority: 1,
      },
      {
        name: "Billing",
        description: "Billing and payment issues",
        color: "#10B981",
        priority: 2,
      },
      {
        name: "General Inquiry",
        description: "General questions and inquiries",
        color: "#3B82F6",
        priority: 3,
      },
      {
        name: "Feature Request",
        description: "New feature requests",
        color: "#8B5CF6",
        priority: 4,
      },
    ];

    const createdCategories = await Category.insertMany(categories);

    // Manually hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create admin users with hashed passwords
    const users = [
      {
        email: "tech@example.com",
        password: hashedPassword,
        firstName: "John",
        lastName: "Tech",
        role: "admin",
        category: createdCategories[0]._id,
      },
      {
        email: "billing@example.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Billing",
        role: "admin",
        category: createdCategories[1]._id,
      },
      {
        email: "general@example.com",
        password: hashedPassword,
        firstName: "Mike",
        lastName: "General",
        role: "admin",
        category: createdCategories[2]._id,
      },
      {
        email: "features@example.com",
        password: hashedPassword,
        firstName: "Lisa",
        lastName: "Features",
        role: "admin",
        category: createdCategories[3]._id,
      },
      {
        email: "superadmin@example.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "Super",
        role: "superadmin",
      },
    ];

    await User.insertMany(users);

    console.log("Database seeded successfully!");
    console.log("Admin Login Credentials:");
    console.log("Technical Support: tech@example.com / password123");
    console.log("Billing: billing@example.com / password123");
    console.log("General Inquiry: general@example.com / password123");
    console.log("Feature Request: features@example.com / password123");
    console.log("Super Admin: superadmin@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

export default seedData;
