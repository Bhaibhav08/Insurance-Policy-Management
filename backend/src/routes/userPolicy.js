const express = require("express");
const UserPolicy = require("../models/UserPolicy");
const Payment = require("../models/Payment");
const Policy = require("../models/PolicyProduct");
const router = express.Router();

// Purchase a policy
router.post("/purchase", async (req, res) => {
  const { policyId, startDate, termMonths, nominee } = req.body;
  try {
    const User = require("../models/User");
    const policy = await Policy.findById(policyId);
    if (!policy) return res.status(404).json({ 
      success: false,
      message: "Policy not found" 
    });

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

    const userPolicy = new UserPolicy({
      userId: req.user._id,
      policyProductId: policy._id,
      startDate: start,
      endDate: end,
      premiumPaid: policy.premium,
      status: "ACTIVE",
      assignedAgentId: assignedAgentId,
      nominee,
    });
    await userPolicy.save();

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
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get my purchased policies
router.get("/", async (req, res) => {
  try {
    const policies = await UserPolicy.find({ userId: req.user._id }).populate("policyProductId");
    res.json({
      success: true,
      data: policies
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Cancel policy (protected, within business rules)
router.put("/:id/cancel", async (req, res) => {
  try {
    const userPolicy = await UserPolicy.findById(req.params.id);
    
    if (!userPolicy) {
      return res.status(404).json({ 
        success: false,
        message: "Policy not found" 
      });
    }

    // Verify the user owns this policy
    if (userPolicy.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own policies"
      });
    }

    // Check if policy can be cancelled (business rules)
    if (userPolicy.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Policy is already cancelled"
      });
    }

    if (userPolicy.status === "EXPIRED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an expired policy"
      });
    }

    // Check if policy is within cancellation period (e.g., within 15 days of purchase)
    const cancellationPeriod = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
    const timeSincePurchase = Date.now() - userPolicy.createdAt.getTime();
    
    if (timeSincePurchase > cancellationPeriod) {
      return res.status(400).json({
        success: false,
        message: "Policy cannot be cancelled after 15 days of purchase"
      });
    }

    // Update policy status
    userPolicy.status = "CANCELLED";
    await userPolicy.save();

    // Log the cancellation
    const AuditLog = require("../models/AuditLog");
    await AuditLog.create({
      action: 'POLICY_CANCELLED',
      userId: req.user._id,
      details: `Policy ${userPolicy._id} cancelled by user`,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    });

    res.json({
      success: true,
      message: "Policy cancelled successfully",
      data: userPolicy
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Legacy route for backward compatibility
router.get("/my-policies", async (req, res) => {
  try {
    const policies = await UserPolicy.find({ userId: req.user._id }).populate("policyProductId");
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
