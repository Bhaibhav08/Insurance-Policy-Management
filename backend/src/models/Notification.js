const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['claim_update', 'payment_success', 'payment_failed', 'policy_created', 'message', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  actionUrl: { type: String }, // URL to navigate when notification is clicked
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data
  expiresAt: { type: Date } // Optional expiration date
}, {
  timestamps: true
});

// Index for efficient queries
schema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", schema);
