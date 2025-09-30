const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: {
    type: String,
    enum: ['general', 'policy', 'claim', 'payment', 'technical'],
    default: 'general'
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
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
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  adminResponse: { type: String },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model("Feedback", schema);
