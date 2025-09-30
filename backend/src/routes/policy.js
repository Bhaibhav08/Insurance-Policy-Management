const express = require("express");
const PolicyProduct = require("../models/PolicyProduct");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

// List all policies (public)
router.get("/", async (req, res) => {
  try {
    const { category, search, minPremium, maxPremium, limit = 20, page = 1 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by premium range
    if (minPremium || maxPremium) {
      query.premium = {};
      if (minPremium) query.premium.$gte = Number(minPremium);
      if (maxPremium) query.premium.$lte = Number(maxPremium);
    }
    
    const skip = (page - 1) * limit;
    const policies = await PolicyProduct.find(query)
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await PolicyProduct.countDocuments(query);
    
    res.json({
      success: true,
      data: policies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get policy by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const policy = await PolicyProduct.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create policy (admin only)
router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  try {
    const policyData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const policy = new PolicyProduct(policyData);
    await policy.save();
    
    res.status(201).json({
      success: true,
      message: "Policy created successfully",
      data: policy
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update policy (admin only)
router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  try {
    const policy = await PolicyProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    
    res.json({
      success: true,
      message: "Policy updated successfully",
      data: policy
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete policy (admin only)
router.delete("/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  
  try {
    const policy = await PolicyProduct.findByIdAndDelete(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    
    res.json({
      success: true,
      message: "Policy deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Purchase policy (authenticated users)
router.post("/:id/purchase", authMiddleware, async (req, res) => {
  try {
    const UserPolicy = require("../models/UserPolicy");
    const Payment = require("../models/Payment");
    const User = require("../models/User");
    
    const policy = await PolicyProduct.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ 
        success: false,
        message: "Policy not found" 
      });
    }
    
    const { startDate, termMonths, nominee } = req.body;
    
    // Calculate dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + (termMonths || policy.termMonths || 12));

    // Get the customer's assigned agent or assign one automatically
    let assignedAgentId = req.user.assignedAgent;
    
    if (!assignedAgentId) {
      // If customer doesn't have an assigned agent, assign one
      const availableAgent = await User.findOne({ role: 'agent', isActive: true });
      if (availableAgent) {
        assignedAgentId = availableAgent._id;
        // Update customer with assigned agent
        await User.findByIdAndUpdate(req.user._id, { assignedAgent: assignedAgentId });
      }
    }

    // Create UserPolicy record with assigned agent
    const userPolicy = new UserPolicy({
      userId: req.user._id,
      policyProductId: policy._id,
      startDate: start,
      endDate: end,
      premiumPaid: policy.premium,
      status: "ACTIVE",
      assignedAgentId: assignedAgentId,
      nominee: nominee || { name: '', relation: '' }
    });
    await userPolicy.save();

    // Create Payment record
    const payment = new Payment({
      userId: req.user._id,
      userPolicyId: userPolicy._id,
      amount: policy.premium,
      method: "SIMULATED",
      reference: `TXN-${Date.now()}`,
      status: "SUCCESS"
    });
    await payment.save();

    // Populate the policy details
    await userPolicy.populate('policyProductId');
    
    res.status(201).json({
      success: true,
      message: "Policy purchased successfully",
      data: userPolicy
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;
