// src/graphql/resolvers.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PolicyProduct = require("../models/PolicyProduct");
const UserPolicy = require("../models/UserPolicy");
const Claim = require("../models/Claim");
const Payment = require("../models/Payment");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await User.findById(user.id);
    },
    policies: async () => await PolicyProduct.find(),
    myPolicies: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await UserPolicy.find({ userId: user.id });
    },
    claims: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      if (user.role === "admin") return await Claim.find();
      return await Claim.find({ userId: user.id });
    },
    paymentsForUser: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await Payment.find({ userId: user.id });
    },
    adminSummary: async (_, __, { user }) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      const usersCount = await User.countDocuments();
      const policiesSold = await UserPolicy.countDocuments();
      const claimsPending = await Claim.countDocuments({ status: "PENDING" });
      const totalPaymentsAgg = await Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const totalPayments = totalPaymentsAgg[0]?.total || 0;
      return { users: usersCount, policiesSold, claimsPending, totalPayments };
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      const { name, email, password, role } = input;
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already in use");

      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashed, role });
      await user.save();

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      return { token, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      return { token, user };
    },

    createPolicy: async (_, { input }, { user }) => {
      if (!user || user.role !== "admin") throw new Error("Unauthorized");
      const policy = new PolicyProduct(input);
      await policy.save();
      return policy;
    },

    purchasePolicy: async (_, { policyId, startDate, termMonths, nominee }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const policy = await PolicyProduct.findById(policyId);
      if (!policy) throw new Error("Policy not found");

      const userPolicy = new UserPolicy({
        userId: user.id,
        policyProductId: policyId,
        startDate,
        endDate: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + termMonths)),
        premiumPaid: policy.premium,
        status: "ACTIVE",
        nominee
      });
      await userPolicy.save();

      // Record simulated payment
      const payment = new Payment({
        userId: user.id,
        userPolicyId: userPolicy._id,
        amount: policy.premium,
        method: "SIMULATED",
        reference: "SIM123",
      });
      await payment.save();

      return userPolicy;
    },

    submitClaim: async (_, { policyId, incidentDate, description, amount }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const userPolicy = await UserPolicy.findOne({ _id: policyId, userId: user.id });
      if (!userPolicy) throw new Error("User policy not found");

      const claim = new Claim({
        userId: user.id,
        userPolicyId: policyId,
        incidentDate,
        description,
        amountClaimed: amount,
        status: "PENDING",
      });
      await claim.save();
      return claim;
    },

    recordPayment: async (_, { policyId, amount, method, reference }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const payment = new Payment({
        userId: user.id,
        userPolicyId: policyId,
        amount,
        method,
        reference,
      });
      await payment.save();
      return payment;
    },
  }
};

module.exports = resolvers;
