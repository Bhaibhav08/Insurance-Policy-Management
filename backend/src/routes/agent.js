const express = require("express");
const User = require("../models/User");
const UserPolicy = require("../models/UserPolicy");
const Claim = require("../models/Claim");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Get agent dashboard summary
router.get("/dashboard", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const agentId = req.user._id;
    
    // Get assigned customers
    const assignedCustomers = await User.find({ assignedAgent: agentId })
      .select('name email phone lastLogin')
      .sort({ lastLogin: -1 })
      .limit(10);

    // Get assigned policies (actual policies sold by this agent)
    const assignedPolicies = await UserPolicy.find({ assignedAgentId: agentId })
      .populate('userId', 'name email')
      .populate('policyProductId', 'title premium category')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get pending claims assigned to this agent
    const pendingClaims = await Claim.find({ 
      assignedAgentId: agentId,
      status: 'PENDING'
    })
      .populate('userPolicyId', 'policyProductId')
      .populate({
        path: 'userPolicyId',
        populate: { path: 'policyProductId', select: 'title category' }
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get all claims for recent activity (not just pending)
    const allClaims = await Claim.find({ assignedAgentId: agentId })
      .populate('userPolicyId', 'policyProductId')
      .populate({
        path: 'userPolicyId',
        populate: { path: 'policyProductId', select: 'title category' }
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get metrics
    // 1. Total assigned policies count
    const totalAssignedPolicies = await UserPolicy.countDocuments({ assignedAgentId: agentId });
    
    // 2. Pending claims count
    const pendingClaimsCount = await Claim.countDocuments({
      status: "PENDING",
      assignedAgentId: agentId
    });
    
    // 3. Calculate total commissions (5% of premiums from sold policies)
    const commissionData = await UserPolicy.aggregate([
      { $match: { assignedAgentId: agentId } },
      { $lookup: { from: 'policyproducts', localField: 'policyProductId', foreignField: '_id', as: 'policy' } },
      { $unwind: '$policy' },
      { $group: { _id: null, totalPremiums: { $sum: '$policy.premium' } } }
    ]);
    
    const totalCommissions = commissionData[0] ? commissionData[0].totalPremiums * 0.05 : 0;
    
    // Additional metrics
    const resolvedClaimsThisMonth = await Claim.countDocuments({
      status: "APPROVED",
      updatedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      },
      assignedAgentId: agentId
    });

    const totalCustomers = await User.countDocuments({ assignedAgent: agentId });

    // Get recent activity
    const recentActivity = await Claim.find({
      assignedAgentId: agentId
    })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5);

    console.log('Agent dashboard data:', {
      agentId,
      pendingClaimsCount,
      pendingClaims: pendingClaims.length,
      allClaims: allClaims.length
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          openClaims: pendingClaimsCount,
          conversionRate: totalCommissions
        },
        assignedCustomers,
        assignedClaims: pendingClaims, // Only pending claims for the pending claims section
        assignedPolicies,
        recentActivity: allClaims, // All claims for recent activity
        // Additional data for proper frontend display
        stats: {
          assignedPolicies: totalAssignedPolicies,
          pendingClaims: pendingClaimsCount,
          totalCommissions: totalCommissions
        }
      }
    });
  } catch (err) {
    console.error('Agent dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get leads (customers who viewed policies but didn't purchase)
router.get("/leads", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const { status = 'active', limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Get customers assigned to this agent who have viewed policies but not purchased
    let query = { assignedAgent: req.user._id };
    
    if (status === 'active') {
      query.lastLogin = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }; // Active in last 7 days
    }

    const leads = await User.find(query)
      .select('name email phone lastLogin createdAt')
      .populate('assignedAgent', 'name email')
      .sort({ lastLogin: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: leads,
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

// Get assigned claims
router.get("/claims", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const { 
      status, 
      priority, 
      search, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    let query = { assignedAgentId: req.user._id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const claims = await Claim.find(query)
      .populate('userId', 'name email phone')
      .populate('userPolicyId', 'policyProductId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    const total = await Claim.countDocuments(query);

    res.json({
      success: true,
      data: claims,
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

// Update claim status
router.patch("/claims/:id/status", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const { status, notes } = req.body;
    const claimId = req.params.id;

    // Verify claim is assigned to this agent
    const claim = await Claim.findOne({ 
      _id: claimId, 
      assignedAgentId: req.user._id 
    });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found or not assigned to you" });
    }

    // Update claim status
    console.log('Updating claim status:', { claimId, status, notes, agentId: req.user._id });
    const updatedClaim = await Claim.findByIdAndUpdate(
      claimId,
      { 
        status, 
        agentNotes: notes,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');
    
    console.log('Claim updated successfully:', { 
      claimId: updatedClaim._id, 
      status: updatedClaim.status,
      updatedAt: updatedClaim.updatedAt 
    });

    // Log the action
    await Message.create({
      from: req.user._id,
      to: claim.userId,
      type: 'claim_update',
      subject: `Claim Status Updated`,
      content: `Your claim has been ${status.toLowerCase()}. ${notes ? `Notes: ${notes}` : ''}`,
      claimId: claimId
    });

    res.json({
      success: true,
      message: "Claim status updated successfully",
      data: updatedClaim
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Request additional documents
router.post("/claims/:id/request-documents", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const { requiredDocuments, message } = req.body;
    const claimId = req.params.id;

    // Verify claim is assigned to this agent
    const claim = await Claim.findOne({ 
      _id: claimId, 
      assignedAgentId: req.user._id 
    });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found or not assigned to you" });
    }

    // Update claim with required documents
    const updatedClaim = await Claim.findByIdAndUpdate(
      claimId,
      { 
        requiredDocuments,
        status: 'NEEDS_INFO',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');

    // Send message to customer
    await Message.create({
      from: req.user._id,
      to: claim.userId,
      type: 'document_request',
      subject: 'Additional Documents Required',
      content: `Please provide the following documents: ${requiredDocuments.join(', ')}. ${message || ''}`,
      claimId: claimId
    });

    res.json({
      success: true,
      message: "Document request sent to customer",
      data: updatedClaim
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get customer details with profile and nominee information
router.get("/customers/:id", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const customer = await User.findOne({
      _id: req.params.id,
      assignedAgent: req.user._id
    }).select('-password');

    if (!customer) {
      return res.status(404).json({ message: "Customer not found or not assigned to you" });
    }

    // Get customer's policies with detailed information
    const policies = await UserPolicy.find({ userId: customer._id })
      .populate('policyProductId', 'title code premium category description')
      .sort({ createdAt: -1 });

    // Get customer's claims with detailed information
    const claims = await Claim.find({ userId: customer._id })
      .populate('userPolicyId', 'policyProductId')
      .populate({
        path: 'userPolicyId',
        populate: { path: 'policyProductId', select: 'title code' }
      })
      .sort({ createdAt: -1 });

    // Get conversation history
    const messages = await Message.find({
      $or: [
        { from: customer._id, to: req.user._id },
        { from: req.user._id, to: customer._id }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    // Calculate some statistics
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'ACTIVE').length;
    const totalClaims = claims.length;
    const pendingClaims = claims.filter(c => c.status === 'PENDING').length;
    const totalClaimAmount = claims.reduce((sum, claim) => sum + (claim.amountClaimed || 0), 0);

    res.json({
      success: true,
      data: {
        customer: {
          ...customer.toObject(),
          // Ensure sensitive data is properly formatted
          profile: customer.profile || {},
          nominees: customer.nominees || []
        },
        policies,
        claims,
        messages,
        statistics: {
          totalPolicies,
          activePolicies,
          totalClaims,
          pendingClaims,
          totalClaimAmount
        }
      }
    });
  } catch (err) {
    console.error('Error fetching customer details:', err);
    res.status(500).json({ message: err.message });
  }
});

// Send message to customer
router.post("/customers/:id/message", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const { subject, content, type = 'general' } = req.body;
    const customerId = req.params.id;

    // Verify customer is assigned to this agent
    const customer = await User.findOne({
      _id: customerId,
      assignedAgent: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found or not assigned to you" });
    }

    const message = await Message.create({
      from: req.user._id,
      to: customerId,
      type,
      subject,
      content
    });

    res.json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get agent's performance metrics
router.get("/performance", async (req, res) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ message: "Forbidden - Agent access required" });
  }

  try {
    const agentId = req.user._id;
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get performance metrics
    const totalCustomers = await User.countDocuments({ assignedAgent: agentId });
    
    const claimsResolved = await Claim.countDocuments({
      assignedAgentId: agentId,
      status: 'APPROVED',
      updatedAt: { $gte: last30Days }
    });

    const claimsPending = await Claim.countDocuments({
      assignedAgentId: agentId,
      status: 'PENDING'
    });

    const averageResponseTime = await Message.aggregate([
      {
        $match: {
          from: agentId,
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: "$responseTime" }
        }
      }
    ]);

    const customerSatisfaction = await Message.aggregate([
      {
        $match: {
          to: agentId,
          type: 'feedback',
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        claimsResolved,
        claimsPending,
        averageResponseTime: averageResponseTime[0]?.avgResponseTime || 0,
        customerSatisfaction: customerSatisfaction[0]?.avgRating || 0,
        conversionRate: totalCustomers > 0 ? (claimsResolved / totalCustomers * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List agents (admin only)
router.get("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { limit = 20, page = 1, search, isActive } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { role: 'agent' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const agents = await User.find(query)
      .select('-password')
      .populate('assignedCustomers', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: agents,
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

// Create agent (admin only)
router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { name, email, password, phone, dateOfBirth } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and password are required" 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if email already exists
    const existingAgent = await User.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create agent
    const agent = new User({
      name,
      email,
      password: hashedPassword,
      role: 'agent',
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      kycStatus: 'pending',
      isActive: true
    });

    await agent.save();

    // Log the agent creation
    const AuditLog = require("../models/AuditLog");
    await AuditLog.create({
      action: 'USER_CREATED',
      userId: req.user._id,
      targetUserId: agent._id,
      details: `New agent ${agent.name} (${agent.email}) created by admin`,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    });

    // Return agent without password
    const agentResponse = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      role: agent.role,
      phone: agent.phone,
      dateOfBirth: agent.dateOfBirth,
      kycStatus: agent.kycStatus,
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Agent created successfully",
      data: agentResponse
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Assign agent to a policy or claim (admin only)
router.put("/:id/assign", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { type, targetId } = req.body; // type: 'policy' or 'claim', targetId: policy/claim ID
    
    if (!type || !targetId) {
      return res.status(400).json({
        success: false,
        message: "Type and target ID are required"
      });
    }

    // Verify agent exists
    const agent = await User.findOne({ _id: req.params.id, role: 'agent' });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found"
      });
    }

    if (type === 'policy') {
      // Assign agent to policy
      const policy = await UserPolicy.findByIdAndUpdate(
        targetId,
        { assignedAgentId: agent._id },
        { new: true }
      ).populate('userId', 'name email');

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found"
        });
      }

      // Log the assignment
      const AuditLog = require("../models/AuditLog");
      await AuditLog.create({
        action: 'AGENT_ASSIGNED',
        userId: req.user._id,
        targetUserId: policy.userId._id,
        details: `Agent ${agent.name} assigned to policy ${policy._id}`,
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
      });

      res.json({
        success: true,
        message: "Agent assigned to policy successfully",
        data: policy
      });

    } else if (type === 'claim') {
      // Assign agent to claim
      const claim = await Claim.findByIdAndUpdate(
        targetId,
        { assignedAgentId: agent._id },
        { new: true }
      ).populate('userId', 'name email');

      if (!claim) {
        return res.status(404).json({
          success: false,
          message: "Claim not found"
        });
      }

      // Log the assignment
      const AuditLog = require("../models/AuditLog");
      await AuditLog.create({
        action: 'AGENT_ASSIGNED',
        userId: req.user._id,
        targetUserId: claim.userId._id,
        details: `Agent ${agent.name} assigned to claim ${claim._id}`,
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
      });

      res.json({
        success: true,
        message: "Agent assigned to claim successfully",
        data: claim
      });

    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'policy' or 'claim'"
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;
