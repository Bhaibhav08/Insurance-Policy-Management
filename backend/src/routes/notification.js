const express = require("express");
const Notification = require("../models/Notification");
const router = express.Router();

// Get user notifications
router.get("/", async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
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

// Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notification preferences
router.get("/preferences", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    res.json({
      success: true,
      data: user.preferences || {
        notifications: true,
        emailUpdates: true,
        pushNotifications: true,
        smsNotifications: false
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update notification preferences
router.patch("/preferences", async (req, res) => {
  try {
    const { notifications, emailUpdates, pushNotifications, smsNotifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'preferences.notifications': notifications,
          'preferences.emailUpdates': emailUpdates,
          'preferences.pushNotifications': pushNotifications,
          'preferences.smsNotifications': smsNotifications
        }
      },
      { new: true }
    ).select('preferences');

    res.json({
      success: true,
      message: "Notification preferences updated",
      data: user.preferences
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
