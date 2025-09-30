const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("../config/db");

const seedAgents = async () => {
  try {
    console.log("Seeding agents...");

    // Check if agents already exist
    const existingAgents = await User.find({ role: "agent" });
    if (existingAgents.length > 0) {
      console.log(`${existingAgents.length} agents already exist in the database.`);
      return;
    }

    // Create sample agents
    const agents = [
      {
        name: "John Smith",
        email: "john.agent@insurance.com",
        password: await bcrypt.hash("password123", 10),
        role: "agent",
        phone: "+1-555-0101",
        isActive: true,
        kycStatus: "verified"
      },
      {
        name: "Sarah Johnson",
        email: "sarah.agent@insurance.com",
        password: await bcrypt.hash("password123", 10),
        role: "agent",
        phone: "+1-555-0102",
        isActive: true,
        kycStatus: "verified"
      },
      {
        name: "Michael Brown",
        email: "michael.agent@insurance.com",
        password: await bcrypt.hash("password123", 10),
        role: "agent",
        phone: "+1-555-0103",
        isActive: true,
        kycStatus: "verified"
      }
    ];

    await User.insertMany(agents);
    console.log(`Successfully seeded ${agents.length} agents.`);
    
    // Also create an admin user if doesn't exist
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const admin = new User({
        name: "Admin User",
        email: "admin@insurance.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
        phone: "+1-555-0001",
        isActive: true,
        kycStatus: "verified"
      });
      await admin.save();
      console.log("Admin user created successfully.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding agents:", error);
    process.exit(1);
  }
};

seedAgents();









