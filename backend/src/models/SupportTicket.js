const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: {
    type: String,
    enum: ['general', 'policy', 'claim', 'payment', 'technical', 'billing'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  policyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PolicyProduct' 
  },
  claimId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Claim' 
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedAgent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  responses: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("SupportTicket", schema);
