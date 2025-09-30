const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  premium: { type: Number, required: true },
  termMonths: { type: Number, required: true },
  minSumInsured: { type: Number, required: true },
  maxSumInsured: { type: Number },
  category: { 
    type: String, 
    enum: ['health', 'car', 'home', 'travel', 'life', 'business'],
    required: true 
  },
  image: { type: String },
  isPopular: { type: Boolean, default: false },
  isCashless: { type: Boolean, default: false },
  benefits: [{ type: String }],
  features: [{ type: String }],
  coverage: {
    inclusions: [{ type: String }],
    exclusions: [{ type: String }]
  },
  eligibility: {
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 65 },
    preExistingConditions: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model("PolicyProduct", schema);
