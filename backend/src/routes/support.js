const express = require("express");
const SupportTicket = require("../models/SupportTicket");
const router = express.Router();

// Create support ticket
router.post("/tickets", async (req, res) => {
  try {
    const { 
      type, 
      priority, 
      subject, 
      description, 
      policyId, 
      claimId 
    } = req.body;
    
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      type: type || 'general',
      priority: priority || 'medium',
      subject,
      description,
      policyId: policyId || null,
      claimId: claimId || null,
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's support tickets
router.get("/tickets/me", async (req, res) => {
  try {
    const { status, priority, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('policyId', 'title code')
      .populate('claimId', 'description amount')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
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

// Get all support tickets (admin/agent only)
router.get("/tickets", async (req, res) => {
  if (!['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden - Admin/Agent access required" });
  }

  try {
    const { 
      status, 
      priority, 
      assignedAgent, 
      limit = 20, 
      page = 1 
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedAgent) query.assignedAgent = assignedAgent;

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name email role')
      .populate('policyId', 'title code')
      .populate('claimId', 'description amount')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
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

// Update support ticket
router.patch("/tickets/:id", async (req, res) => {
  try {
    const { status, priority, assignedAgent, response } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    // Check permissions
    if (ticket.userId.toString() !== req.user.id && !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedAgent) updateData.assignedAgent = assignedAgent;
    if (response) {
      updateData.responses = updateData.responses || [];
      updateData.responses.push({
        userId: req.user.id,
        message: response,
        createdAt: new Date()
      });
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email')
     .populate('assignedAgent', 'name email');

    res.json({
      success: true,
      message: "Support ticket updated successfully",
      data: updatedTicket
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get support statistics (admin only)
router.get("/stats", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });
    
    const ticketsByType = await SupportTicket.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const ticketsByPriority = await SupportTicket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        closedTickets,
        ticketsByType,
        ticketsByPriority
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
