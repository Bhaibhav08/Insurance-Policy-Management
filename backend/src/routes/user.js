const express = require("express");
const User = require("../models/User");
const UserPolicy = require("../models/UserPolicy");
const Claim = require("../models/Claim");
const Payment = require("../models/Payment");
const router = express.Router();

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.patch("/me", async (req, res) => {
  try {
    const { name, phone, dateOfBirth, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, dateOfBirth, avatar },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's policies
router.get("/me/policies", async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (status) query.status = status;

    const policies = await UserPolicy.find(query)
      .populate('policyProductId', 'title code premium category image')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await UserPolicy.countDocuments(query);

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

// Get user's claims
router.get("/me/claims", async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (status) query.status = status;

    const claims = await Claim.find(query)
      .populate('userPolicyId', 'policyProductId')
      .populate('assignedAgentId', 'name email')
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

// Get user's payments
router.get("/me/payments", async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('userPolicyId', 'policyProductId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
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

// Get user dashboard summary
router.get("/me/dashboard", async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let dashboardData = {};

    if (role === 'customer') {
      // Customer dashboard
      const policiesCount = await UserPolicy.countDocuments({ userId });
      const activePolicies = await UserPolicy.countDocuments({ userId, status: 'ACTIVE' });
      const claimsCount = await Claim.countDocuments({ userId });
      const pendingClaims = await Claim.countDocuments({ userId, status: 'PENDING' });
      
      const recentPolicies = await UserPolicy.find({ userId })
        .populate('policyProductId', 'title code premium category image')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentClaims = await Claim.find({ userId })
        .populate('userPolicyId', 'policyProductId')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        summary: {
          totalPolicies: policiesCount,
          activePolicies,
          totalClaims: claimsCount,
          pendingClaims
        },
        recentPolicies,
        recentClaims
      };
    } else if (role === 'agent') {
      // Agent dashboard
      const assignedCustomers = await User.countDocuments({ assignedAgent: userId });
      const assignedClaims = await Claim.countDocuments({ assignedAgentId: userId });
      const pendingClaims = await Claim.countDocuments({ assignedAgentId: userId, status: 'PENDING' });
      
      const recentClaims = await Claim.find({ assignedAgentId: userId })
        .populate('userId', 'name email')
        .populate('userPolicyId', 'policyProductId')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentCustomers = await User.find({ assignedAgent: userId })
        .select('name email lastLogin')
        .sort({ lastLogin: -1 })
        .limit(5);

      dashboardData = {
        summary: {
          assignedCustomers,
          assignedClaims,
          pendingClaims
        },
        recentClaims,
        recentCustomers
      };
    } else if (role === 'admin') {
      // Admin dashboard
      const totalUsers = await User.countDocuments();
      const totalAgents = await User.countDocuments({ role: 'agent' });
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const totalPolicies = await PolicyProduct.countDocuments();
      const totalClaims = await Claim.countDocuments();
      const pendingClaims = await Claim.countDocuments({ status: 'PENDING' });
      const approvedClaims = await Claim.countDocuments({ status: 'APPROVED' });
      const rejectedClaims = await Claim.countDocuments({ status: 'REJECTED' });
      
      const recentUsers = await User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentClaims = await Claim.find()
        .populate('userId', 'name email')
        .populate('userPolicyId', 'policyProductId')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        summary: {
          totalUsers,
          totalAgents,
          totalCustomers,
          totalPolicies,
          totalClaims,
          pendingClaims,
          approvedClaims,
          rejectedClaims
        },
        recentUsers,
        recentClaims
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all agents for admin
router.get("/agents", async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const agents = await User.find({ role: 'agent' })
      .select('-password')
      .populate('assignedCustomers', 'name email')
      .sort({ createdAt: -1 });

    // Get additional statistics for each agent
    const agentsWithStats = await Promise.all(agents.map(async (agent) => {
      const assignedCustomersCount = await User.countDocuments({ assignedAgent: agent._id });
      const assignedPoliciesCount = await UserPolicy.countDocuments({ assignedAgentId: agent._id });
      const pendingClaimsCount = await Claim.countDocuments({ assignedAgentId: agent._id, status: 'PENDING' });
      const totalClaimsCount = await Claim.countDocuments({ assignedAgentId: agent._id });
      
      return {
        ...agent.toObject(),
        statistics: {
          assignedCustomers: assignedCustomersCount,
          assignedPolicies: assignedPoliciesCount,
          pendingClaims: pendingClaimsCount,
          totalClaims: totalClaimsCount
        }
      };
    }));

    res.json({
      success: true,
      data: agentsWithStats
    });
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all customers for admin
router.get("/customers", async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });

    // Get additional statistics for each customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const policiesCount = await UserPolicy.countDocuments({ userId: customer._id });
      const activePoliciesCount = await UserPolicy.countDocuments({ userId: customer._id, status: 'ACTIVE' });
      const claimsCount = await Claim.countDocuments({ userId: customer._id });
      const pendingClaimsCount = await Claim.countDocuments({ userId: customer._id, status: 'PENDING' });
      
      return {
        ...customer.toObject(),
        statistics: {
          totalPolicies: policiesCount,
          activePolicies: activePoliciesCount,
          totalClaims: claimsCount,
          pendingClaims: pendingClaimsCount
        }
      };
    }));

    res.json({
      success: true,
      data: customersWithStats
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get specific agent details for admin
router.get("/agents/:id", async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const agent = await User.findOne({ _id: req.params.id, role: 'agent' })
      .select('-password')
      .populate('assignedCustomers', 'name email phone');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Get detailed statistics
    const assignedCustomers = await User.find({ assignedAgent: agent._id })
      .select('name email phone lastLogin createdAt')
      .sort({ lastLogin: -1 });

    const assignedPolicies = await UserPolicy.find({ assignedAgentId: agent._id })
      .populate('userId', 'name email')
      .populate('policyProductId', 'title code premium category')
      .sort({ createdAt: -1 });

    const claims = await Claim.find({ assignedAgentId: agent._id })
      .populate('userId', 'name email')
      .populate('userPolicyId', 'policyProductId')
      .sort({ createdAt: -1 });

    const statistics = {
      assignedCustomers: assignedCustomers.length,
      assignedPolicies: assignedPolicies.length,
      pendingClaims: claims.filter(c => c.status === 'PENDING').length,
      totalClaims: claims.length,
      approvedClaims: claims.filter(c => c.status === 'APPROVED').length,
      rejectedClaims: claims.filter(c => c.status === 'REJECTED').length
    };

    res.json({
      success: true,
      data: {
        agent,
        assignedCustomers,
        assignedPolicies,
        claims,
        statistics
      }
    });
  } catch (err) {
    console.error('Error fetching agent details:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get specific customer details for admin
router.get("/customers/:id", async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const customer = await User.findOne({ _id: req.params.id, role: 'customer' })
      .select('-password')
      .populate('assignedAgent', 'name email phone');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get detailed information
    const policies = await UserPolicy.find({ userId: customer._id })
      .populate('policyProductId', 'title code premium category description')
      .sort({ createdAt: -1 });

    const claims = await Claim.find({ userId: customer._id })
      .populate('userPolicyId', 'policyProductId')
      .populate({
        path: 'userPolicyId',
        populate: { path: 'policyProductId', select: 'title code' }
      })
      .sort({ createdAt: -1 });

    const statistics = {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.status === 'ACTIVE').length,
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === 'PENDING').length,
      approvedClaims: claims.filter(c => c.status === 'APPROVED').length,
      rejectedClaims: claims.filter(c => c.status === 'REJECTED').length,
      totalClaimAmount: claims.reduce((sum, claim) => sum + (claim.amountClaimed || 0), 0)
    };

    res.json({
      success: true,
      data: {
        customer: {
          ...customer.toObject(),
          profile: customer.profile || {},
          nominees: customer.nominees || []
        },
        policies,
        claims,
        statistics
      }
    });
  } catch (err) {
    console.error('Error fetching customer details:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
