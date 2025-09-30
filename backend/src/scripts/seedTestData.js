const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PolicyProduct = require("../models/PolicyProduct");
const UserPolicy = require("../models/UserPolicy");
const Claim = require("../models/Claim");
const Payment = require("../models/Payment");
require("../config/db");

const seedTestData = async () => {
  try {
    console.log("Seeding test data...");

    // Clear existing data
    await User.deleteMany({});
    await PolicyProduct.deleteMany({});
    await UserPolicy.deleteMany({});
    await Claim.deleteMany({});
    await Payment.deleteMany({});

    // Create agents
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
      }
    ];

    const createdAgents = await User.insertMany(agents);
    console.log(`Created ${createdAgents.length} agents`);

    // Create customers
    const customers = [
      {
        name: "Alice Customer",
        email: "alice@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "customer",
        phone: "+1-555-1001",
        assignedAgent: createdAgents[0]._id,
        isActive: true,
        kycStatus: "verified"
      },
      {
        name: "Bob Customer",
        email: "bob@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "customer",
        phone: "+1-555-1002",
        assignedAgent: createdAgents[1]._id,
        isActive: true,
        kycStatus: "verified"
      }
    ];

    const createdCustomers = await User.insertMany(customers);
    console.log(`Created ${createdCustomers.length} customers`);

    // Create admin
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
    console.log("Created admin user");

    // Create policy products
    const policies = [
      {
        title: "Health Insurance Premium",
        description: "Comprehensive health coverage for individuals and families",
        category: "Health",
        premium: 5000,
        minSumInsured: 500000,
        maxSumInsured: 1000000,
        termMonths: 12,
        code: "HI001",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
      },
      {
        title: "Life Insurance Basic",
        description: "Term life insurance with flexible coverage options",
        category: "Life",
        premium: 3000,
        minSumInsured: 1000000,
        maxSumInsured: 5000000,
        termMonths: 12,
        code: "LI001",
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"
      },
      {
        title: "Auto Insurance",
        description: "Complete vehicle protection with roadside assistance",
        category: "Auto",
        premium: 2500,
        minSumInsured: 200000,
        maxSumInsured: 1000000,
        termMonths: 12,
        code: "AI001",
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400"
      }
    ];

    const createdPolicies = await PolicyProduct.insertMany(policies);
    console.log(`Created ${createdPolicies.length} policies`);

    // Create user policies (customers purchasing policies)
    const userPolicies = [
      {
        userId: createdCustomers[0]._id,
        policyProductId: createdPolicies[0]._id,
        assignedAgentId: createdAgents[0]._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        premiumPaid: createdPolicies[0].premium,
        status: "ACTIVE",
        nominee: { name: "John Doe", relation: "Spouse" }
      },
      {
        userId: createdCustomers[0]._id,
        policyProductId: createdPolicies[1]._id,
        assignedAgentId: createdAgents[0]._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        premiumPaid: createdPolicies[1].premium,
        status: "ACTIVE",
        nominee: { name: "Jane Doe", relation: "Child" }
      },
      {
        userId: createdCustomers[1]._id,
        policyProductId: createdPolicies[2]._id,
        assignedAgentId: createdAgents[1]._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        premiumPaid: createdPolicies[2].premium,
        status: "ACTIVE",
        nominee: { name: "Bob Jr", relation: "Child" }
      }
    ];

    const createdUserPolicies = await UserPolicy.insertMany(userPolicies);
    console.log(`Created ${createdUserPolicies.length} user policies`);

    // Create payments
    const payments = createdUserPolicies.map(up => ({
      userId: up.userId,
      userPolicyId: up._id,
      amount: up.premiumPaid,
      method: "ONLINE",
      reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    await Payment.insertMany(payments);
    console.log(`Created ${payments.length} payments`);

    // Create claims
    const claims = [
      {
        userId: createdCustomers[0]._id,
        userPolicyId: createdUserPolicies[0]._id,
        assignedAgentId: createdAgents[0]._id,
        incidentDate: new Date(),
        description: "Medical emergency - hospitalization required",
        amountClaimed: 25000,
        status: "PENDING"
      },
      {
        userId: createdCustomers[1]._id,
        userPolicyId: createdUserPolicies[2]._id,
        assignedAgentId: createdAgents[1]._id,
        incidentDate: new Date(),
        description: "Vehicle accident - repair required",
        amountClaimed: 15000,
        status: "PENDING"
      }
    ];

    await Claim.insertMany(claims);
    console.log(`Created ${claims.length} claims`);

    console.log("\n=== Test Data Created Successfully ===");
    console.log("Agents:");
    console.log("- john.agent@insurance.com / password123");
    console.log("- sarah.agent@insurance.com / password123");
    console.log("\nCustomers:");
    console.log("- alice@example.com / password123");
    console.log("- bob@example.com / password123");
    console.log("\nAdmin:");
    console.log("- admin@insurance.com / admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding test data:", error);
    process.exit(1);
  }
};

seedTestData();









