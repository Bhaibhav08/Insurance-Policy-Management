const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const router = express.Router();

// Get user messages/conversations
router.get("/", async (req, res) => {
  try {
    const { 
      type, 
      with: withUser, 
      limit = 20, 
      page = 1 
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    };

    if (type) query.type = type;
    if (withUser) {
      query.$and = [
        query,
        {
          $or: [
            { from: withUser, to: req.user.id },
            { from: req.user.id, to: withUser }
          ]
        }
      ];
    }

    const messages = await Message.find(query)
      .populate('from', 'name email role')
      .populate('to', 'name email role')
      .populate('claimId', 'description amount status')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      data: messages,
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

// Get conversation with specific user
router.get("/conversation/:userId", async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { from: req.user.id, to: req.params.userId },
        { from: req.params.userId, to: req.user.id }
      ]
    })
      .populate('from', 'name email role avatar')
      .populate('to', 'name email role avatar')
      .populate('claimId', 'description amount status')
      .sort({ createdAt: 1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Message.countDocuments({
      $or: [
        { from: req.user.id, to: req.params.userId },
        { from: req.params.userId, to: req.user.id }
      ]
    });

    // Mark messages as read
    await Message.updateMany(
      {
        from: req.params.userId,
        to: req.user.id,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: messages,
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

// Send message
router.post("/", async (req, res) => {
  try {
    const { to, subject, content, type = 'general', claimId } = req.body;

    // Verify recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check if user can message this recipient
    if (req.user.role === 'customer' && recipient.role === 'agent') {
      // Customer can only message their assigned agent
      if (recipient._id.toString() !== req.user.assignedAgent?.toString()) {
        return res.status(403).json({ message: "You can only message your assigned agent" });
      }
    } else if (req.user.role === 'agent' && recipient.role === 'customer') {
      // Agent can only message their assigned customers
      if (recipient.assignedAgent?.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only message your assigned customers" });
      }
    }

    const message = await Message.create({
      from: req.user.id,
      to,
      type,
      subject,
      content,
      claimId: claimId || null
    });

    // Populate the created message
    const populatedMessage = await Message.findById(message._id)
      .populate('from', 'name email role avatar')
      .populate('to', 'name email role avatar')
      .populate('claimId', 'description amount status');

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark message as read
router.patch("/:id/read", async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, to: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({
      success: true,
      message: "Message marked as read",
      data: message
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread message count
router.get("/unread-count", async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      to: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete message
router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get conversation list (for chat interface)
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: req.user.id },
            { to: req.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", req.user.id] },
              "$to",
              "$from"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", req.user.id] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          role: "$user.role",
          avatar: "$user.avatar",
          lastMessage: {
            content: "$lastMessage.content",
            type: "$lastMessage.type",
            createdAt: "$lastMessage.createdAt",
            isRead: "$lastMessage.isRead"
          },
          unreadCount: 1
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
