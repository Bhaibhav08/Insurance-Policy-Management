const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['general', 'claim_update', 'document_request', 'payment_reminder', 'feedback', 'support'],
    default: 'general' 
  },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  claimId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Claim' 
  },
  attachments: [{ 
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  responseTime: { type: Number }, // Time taken to respond in minutes
  rating: { type: Number, min: 1, max: 5 }, // For feedback messages
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes for efficient queries
schema.index({ from: 1, to: 1, createdAt: -1 });
schema.index({ to: 1, isRead: 1 });
schema.index({ claimId: 1 });

module.exports = mongoose.model("Message", schema);
