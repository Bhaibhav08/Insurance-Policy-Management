const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'agent', 'admin'], 
    default: "customer" 
  },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date },
  avatar: { type: String },
  kycStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  isActive: { type: Boolean, default: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastLogin: { type: Date },
  preferences: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true }
  },
  // Enhanced customer profile details
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    middleName: { type: String },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'prefer_not_to_say'] 
    },
    maritalStatus: { 
      type: String, 
      enum: ['single', 'married', 'divorced', 'widowed', 'separated'] 
    },
    occupation: { type: String },
    employer: { type: String },
    annualIncome: { type: Number },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'India' }
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    documents: {
      panNumber: { type: String },
      aadharNumber: { type: String },
      drivingLicense: { type: String },
      passportNumber: { type: String }
    }
  },
  // Nominee details
  nominees: [{
    name: { type: String, required: true },
    relationship: { 
      type: String, 
      required: true,
      enum: ['spouse', 'child', 'parent', 'sibling', 'other']
    },
    dateOfBirth: { type: Date },
    phone: { type: String },
    email: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: 'India' }
    },
    sharePercentage: { type: Number, min: 0, max: 100, default: 100 },
    isPrimary: { type: Boolean, default: false },
    documents: {
      aadharNumber: { type: String },
      panNumber: { type: String }
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("User", schema);
