const express = require("express");
const Claim = require("../models/Claim");
const UserPolicy = require("../models/UserPolicy");
const router = express.Router();

// Submit a claim
router.post("/", async (req, res) => {
  const { policyId, userPolicyId, description, incidentDate, amount } = req.body;
  try {
    // Handle both policyId (from frontend) and userPolicyId (direct)
    const actualUserPolicyId = userPolicyId || policyId;
    
    const userPolicy = await UserPolicy.findById(actualUserPolicyId);
    if (!userPolicy) return res.status(404).json({ 
      success: false,
      message: "User policy not found" 
    });

    // Verify the user owns this policy
    if (userPolicy.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only claim on your own policies"
      });
    }

    // Get the assigned agent from the policy
    let assignedAgentId = userPolicy.assignedAgentId;
    
    // If no agent is assigned to the policy, try to get from user
    if (!assignedAgentId) {
      const User = require("../models/User");
      const customer = await User.findById(req.user._id);
      assignedAgentId = customer.assignedAgent;
      
      // If still no agent, assign one automatically
      if (!assignedAgentId) {
        const availableAgent = await User.findOne({ role: 'agent', isActive: true });
        if (availableAgent) {
          assignedAgentId = availableAgent._id;
        }
      }
    }

    const claim = new Claim({
      userId: req.user._id,
      userPolicyId: actualUserPolicyId,
      description,
      incidentDate,
      amountClaimed: amount,
      status: "PENDING",
      assignedAgentId: assignedAgentId,
    });
    await claim.save();
    
    // Populate the user policy details
    await claim.populate({
      path: 'userPolicyId',
      populate: {
        path: 'policyProductId',
        select: 'title code'
      }
    });

    res.status(201).json({
      success: true,
      message: "Claim submitted successfully",
      data: claim
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get my claims
router.get("/", async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user._id })
      .populate({
        path: 'userPolicyId',
        populate: {
          path: 'policyProductId',
          select: 'title code'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: claims
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get specific claim detail (role-based access)
router.get("/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate({
        path: 'userPolicyId',
        populate: {
          path: 'policyProductId',
          select: 'title code premium category'
        }
      })
      .populate('userId', 'name email phone')
      .populate('assignedAgentId', 'name email')
      .populate('decidedByAgentId', 'name email');
    
    if (!claim) {
      return res.status(404).json({ 
        success: false,
        message: "Claim not found" 
      });
    }

    // Role-based access control
    if (req.user.role === 'customer') {
      // Customers can only see their own claims
      if (claim.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied - You can only view your own claims"
        });
      }
    } else if (req.user.role === 'agent') {
      // Agents can see claims assigned to them or all claims if they're admin
      if (claim.assignedAgentId && claim.assignedAgentId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied - You can only view claims assigned to you"
        });
      }
    }
    // Admin can see all claims (no additional check needed)
    
    res.json({
      success: true,
      data: claim
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Admin: update claim status
router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    claim.status = req.body.status;
    if (req.body.decisionNotes) claim.decisionNotes = req.body.decisionNotes;
    if (req.user && req.user._id) claim.decidedByAgentId = req.user._id;
    await claim.save();
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agent: update claim status
router.patch("/:id/status", async (req, res) => {
  if (req.user.role !== "agent") return res.status(403).json({ 
    success: false,
    message: "Only agents can update claim status" 
  });

  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ 
      success: false,
      message: "Claim not found" 
    });

    // Check if the agent is assigned to this claim
    if (claim.assignedAgentId && claim.assignedAgentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update claims assigned to you"
      });
    }

    // Update claim status
    claim.status = req.body.status;
    if (req.body.notes) claim.decisionNotes = req.body.notes;
    claim.decidedByAgentId = req.user._id;
    claim.decidedAt = new Date();
    
    await claim.save();

    res.json({
      success: true,
      message: "Claim status updated successfully",
      data: claim
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Cancel a claim (customer only)
router.patch("/:id/cancel", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ 
        success: false,
        message: "Claim not found" 
      });
    }

    // Verify the user owns this claim
    if (claim.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own claims"
      });
    }

    // Only allow cancellation of pending claims
    if (claim.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending claims can be cancelled"
      });
    }

    // Update claim status to cancelled
    claim.status = "CANCELLED";
    claim.decisionNotes = "Cancelled by customer";
    claim.decidedAt = new Date();
    await claim.save();

    res.json({
      success: true,
      message: "Claim cancelled successfully",
      data: claim
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;
