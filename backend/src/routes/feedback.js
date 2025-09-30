const express = require("express");
const Feedback = require("../models/Feedback");
const router = express.Router();

// Submit feedback
router.post("/", async (req, res) => {
  try {
    const { type, subject, message, rating, policyId, claimId } = req.body;
    
    const feedback = await Feedback.create({
      userId: req.user.id,
      type: type || 'general',
      subject,
      message,
      rating: rating || null,
      policyId: policyId || null,
      claimId: claimId || null
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's feedback
router.get("/me", async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ userId: req.user.id })
      .populate('policyId', 'title code')
      .populate('claimId', 'description amount')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Feedback.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: feedback,
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

// Get all feedback (admin only)
router.get("/all", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { 
      type, 
      rating, 
      status, 
      limit = 20, 
      page = 1 
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (rating) query.rating = rating;
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .populate('userId', 'name email role')
      .populate('policyId', 'title code')
      .populate('claimId', 'description amount')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: feedback,
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

// Update feedback status (admin only)
router.patch("/:id/status", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const { status, adminResponse } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { 
        status: status || 'reviewed',
        adminResponse: adminResponse || null,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({
      success: true,
      message: "Feedback status updated successfully",
      data: feedback
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get feedback statistics (admin only)
router.get("/stats", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  try {
    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const feedbackByType = await Feedback.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const feedbackByRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalFeedback,
        averageRating: averageRating[0]?.avgRating || 0,
        feedbackByType,
        feedbackByRating
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
