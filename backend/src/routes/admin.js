const express = require("express");
const User = require("../models/User");
const UserPolicy = require("../models/UserPolicy");
const Claim = require("../models/Claim");
const Payment = require("../models/Payment");
const PolicyProduct = require("../models/PolicyProduct");
const AuditLog = require("../models/AuditLog");
const router = express.Router();

// Admin summary dashboard
router.get("/summary", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get basic counts
    const usersCount = await User.countDocuments();
    const policiesSold = await UserPolicy.countDocuments();
    const claimsPending = await Claim.countDocuments({ status: "PENDING" });
    
    // Get recent activity counts
    const newUsersLast30Days = await User.countDocuments({ 
      createdAt: { $gte: last30Days } 
    });
    const policiesSoldLast30Days = await UserPolicy.countDocuments({ 
      createdAt: { $gte: last30Days } 
    });
    const claimsSubmittedLast30Days = await Claim.countDocuments({ 
      createdAt: { $gte: last30Days } 
    });
    
    // Get payment totals
    const totalPayments = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const paymentsLast30Days = await Payment.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    // Get claims by status
    const claimsByStatus = await Claim.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get user registrations by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Format claims by status
    const claimsStatusMap = {};
    claimsByStatus.forEach(item => {
      claimsStatusMap[item._id] = item.count;
    });

    // Format users by role
    const usersRoleMap = {};
    usersByRole.forEach(item => {
      usersRoleMap[item._id] = item.count;
    });

    res.json({
      success: true,
      totalUsers: usersCount,
      totalPolicies: policiesSold,
      pendingClaims: claimsPending,
      monthlyRevenue: paymentsLast30Days[0]?.total || 0,
      totalAgents: usersRoleMap.agent || 0,
      totalCustomers: usersRoleMap.customer || 0,
      approvedClaims: claimsStatusMap.APPROVED || 0,
      rejectedClaims: claimsStatusMap.REJECTED || 0,
      data: {
        overview: {
          users: usersCount,
          policiesSold,
          claimsPending,
          totalPayments: totalPayments[0]?.total || 0
        },
        last30Days: {
          newUsers: newUsersLast30Days,
          policiesSold: policiesSoldLast30Days,
          claimsSubmitted: claimsSubmittedLast30Days,
          payments: paymentsLast30Days[0]?.total || 0
        },
        breakdown: {
          claimsByStatus,
          usersByRole
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recent activity feed
router.get("/activity", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const activities = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      data: activities,
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

// Get all users with pagination and filters
router.get("/users", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { 
      role, 
      status, 
      search, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    let query = {};
    
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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

// Update user status
router.patch("/users/:id/status", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the action
    await AuditLog.create({
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      userId: req.user.id,
      targetUserId: user._id,
      details: `User ${user.name} ${isActive ? 'activated' : 'deactivated'}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign agent to customer
router.patch("/users/:id/assign-agent", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { agentId } = req.body;
    
    // Verify agent exists and has agent role
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agentId },
      { new: true }
    ).select('-password').populate('assignedAgent', 'name email');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the action
    await AuditLog.create({
      action: 'AGENT_ASSIGNED',
      userId: req.user.id,
      targetUserId: user._id,
      details: `Agent ${agent.name} assigned to customer ${user.name}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: "Agent assigned successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get audit logs
router.get("/audit", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { 
      action, 
      userId, 
      startDate, 
      endDate, 
      limit = 50, 
      page = 1 
    } = req.query;
    
    let query = {};
    
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    const total = await AuditLog.countDocuments(query);

    // Transform the data to match frontend expectations
    const transformedLogs = logs.map(log => ({
      _id: log._id,
      action: log.action,
      actor: log.userId ? {
        _id: log.userId._id,
        name: log.userId.name,
        email: log.userId.email
      } : null,
      targetUser: log.targetUserId ? {
        _id: log.targetUserId._id,
        name: log.targetUserId.name,
        email: log.targetUserId.email
      } : null,
      details: log.details,
      ip: log.ipAddress,
      timestamp: log.createdAt
    }));

    res.json({
      success: true,
      data: transformedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get monthly revenue data
router.get("/revenue", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const now = new Date();
    const last6Months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      });
    }

    // Get revenue for each month
    const revenueData = await Promise.all(
      last6Months.map(async (month) => {
        const revenue = await Payment.aggregate([
          {
            $match: {
              createdAt: {
                $gte: month.startDate,
                $lte: month.endDate
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" }
            }
          }
        ]);

        return {
          month: month.month,
          revenue: revenue[0]?.total || 0
        };
      })
    );

    res.json({
      success: true,
      data: revenueData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get system statistics
router.get("/stats", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $limit: 30 }
    ]);

    // Policy sales
    const policySales = await UserPolicy.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$premiumPaid" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      { $limit: 30 }
    ]);

    // Claims by status
    const claimsStats = await Claim.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        policySales,
        claimsStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID (admin only)
router.get("/users/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedAgent', 'name email');

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

// Update user (admin only)
router.patch("/users/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { name, email, role, phone, isActive, assignedAgent } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, isActive, assignedAgent },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (admin only)
router.delete("/users/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
