const mongoose = require('mongoose');
const PolicyProduct = require('../models/PolicyProduct');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkPolicies() {
  try {
    console.log('🔍 Checking all policies in database...');
    
    const policies = await PolicyProduct.find({});
    
    console.log(`📊 Found ${policies.length} policies in database:`);
    console.log('='.repeat(60));
    
    policies.forEach((policy, index) => {
      console.log(`${index + 1}. ID: ${policy._id}`);
      console.log(`   Title: ${policy.title}`);
      console.log(`   Code: ${policy.code}`);
      console.log(`   Category: ${policy.category}`);
      console.log(`   Image: ${policy.image ? '✅ Has image' : '❌ No image'}`);
      console.log(`   Created: ${policy.createdAt}`);
      console.log('-'.repeat(40));
    });
    
    if (policies.length === 0) {
      console.log('❌ No policies found in database!');
      console.log('💡 You may need to create some policies first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking policies:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
checkPolicies();

