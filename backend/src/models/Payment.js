const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userPolicyId: { type: mongoose.Schema.Types.ObjectId, ref: "UserPolicy", required: true },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['CARD', 'NETBANKING', 'OFFLINE', 'SIMULATED', 'UPI'],
    required: true 
  },
  reference: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING',
    required: true 
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model("Payment", schema);
