const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: "UserPolicy", required: true },
  incidentDate: { type: Date },
  description: String,
  amountClaimed: Number,
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], default: "PENDING" },
  decisionNotes: String,
  decidedByAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  decidedAt: { type: Date },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Claim", schema);
