const mongoose = require('mongoose');
const PolicyProduct = require('../models/PolicyProduct');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Image mapping by category
const imageMap = {
  'life': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
  'health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
  'auto': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
  'car': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
  'home': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
  'travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
  'business': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'
};

async function addImagesToPolicies() {
  try {
    console.log('🔄 Starting to add images to existing policies...');
    
    // Get all policies without images
    const policies = await PolicyProduct.find({
      $or: [
        { image: { $exists: false } },
        { image: null },
        { image: '' }
      ]
    });
    
    console.log(`📊 Found ${policies.length} policies without images`);
    
    if (policies.length === 0) {
      console.log('✅ All policies already have images!');
      return;
    }
    
    let updatedCount = 0;
    
    for (const policy of policies) {
      const imageUrl = imageMap[policy.category] || imageMap['business'];
      
      await PolicyProduct.findByIdAndUpdate(policy._id, {
        image: imageUrl
      });
      
      updatedCount++;
      console.log(`✅ Updated policy: ${policy.title} (${policy.category})`);
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} policies with images!`);
    
  } catch (error) {
    console.error('❌ Error adding images to policies:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
addImagesToPolicies();

