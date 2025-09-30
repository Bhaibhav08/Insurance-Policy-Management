const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema({
  name: String,
  relation: String,
}, { _id: false });

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  policyProductId: { type: mongoose.Schema.Types.ObjectId, ref: "PolicyProduct", required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  premiumPaid: { type: Number },
  status: { type: String, enum: ["ACTIVE", "EXPIRED", "CANCELLED"], default: "ACTIVE" },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  nominee: nomineeSchema,
}, { timestamps: true });

module.exports = mongoose.model("UserPolicy", schema);
