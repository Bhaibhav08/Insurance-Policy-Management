const express = require("express");
const Payment = require("../models/Payment");
const UserPolicy = require("../models/UserPolicy");
const router = express.Router();

// Record payment for a policy (protected)
router.post("/", async (req, res) => {
  try {
    const { policyId, amount, method, reference } = req.body;
    
    // Validation
    if (!policyId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Policy ID, amount, and method are required"
      });
    }

    // Verify the policy exists and belongs to the user
    const userPolicy = await UserPolicy.findById(policyId);
    if (!userPolicy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found"
      });
    }

    if (userPolicy.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only make payments for your own policies"
      });
    }

    // Validate payment method
    const validMethods = ['CARD', 'NETBANKING', 'OFFLINE', 'SIMULATED', 'UPI'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      userPolicyId: policyId,
      amount: amount,
      method: method,
      reference: reference || `TXN-${Date.now()}`,
      status: "SUCCESS" // Simulated success for MVP
    });

    await payment.save();

    // Log the payment
    const AuditLog = require("../models/AuditLog");
    await AuditLog.create({
      action: 'PAYMENT_PROCESSED',
      userId: req.user._id,
      details: `Payment of ₹${amount} recorded for policy ${policyId}`,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    });

    // Populate the policy details
    await payment.populate('userPolicyId');

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get my payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).populate("userPolicyId");
    res.json({
      success: true,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get user payments (for frontend compatibility)
router.get("/user", async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).populate("userPolicyId");
    res.json({
      success: true,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;
