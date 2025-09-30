const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
require('../config/db');

const seedAuditLogs = async () => {
  try {
    console.log('Seeding audit logs...');

    // Check if audit logs already exist
    const existingLogs = await AuditLog.countDocuments();
    if (existingLogs > 0) {
      console.log(`${existingLogs} audit logs already exist in the database.`);
      return;
    }

    // Get some users to create audit logs for
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }

    const sampleLogs = [
      {
        action: 'LOGIN',
        userId: users[0]._id,
        details: `User ${users[0].name} logged in successfully`,
        ipAddress: '192.168.1.100'
      },
      {
        action: 'POLICY_CREATED',
        userId: users[0]._id,
        details: 'Health Insurance policy created for customer',
        ipAddress: '192.168.1.100'
      },
      {
        action: 'CLAIM_CREATED',
        userId: users[1] ? users[1]._id : users[0]._id,
        details: 'Medical claim submitted for review',
        ipAddress: '192.168.1.101'
      },
      {
        action: 'CLAIM_APPROVED',
        userId: users[2] ? users[2]._id : users[0]._id,
        details: 'Claim #12345 approved by agent',
        ipAddress: '192.168.1.102'
      },
      {
        action: 'AGENT_ASSIGNED',
        userId: users[3] ? users[3]._id : users[0]._id,
        targetUserId: users[1] ? users[1]._id : users[0]._id,
        details: `Agent ${users[3] ? users[3].name : users[0].name} assigned to customer`,
        ipAddress: '192.168.1.103'
      },
      {
        action: 'USER_CREATED',
        userId: users[4] ? users[4]._id : users[0]._id,
        details: `New customer ${users[4] ? users[4].name : 'John Doe'} registered`,
        ipAddress: '192.168.1.104'
      },
      {
        action: 'PAYMENT_PROCESSED',
        userId: users[0]._id,
        details: 'Premium payment of ₹5,000 processed successfully',
        ipAddress: '192.168.1.100'
      },
      {
        action: 'POLICY_UPDATED',
        userId: users[1] ? users[1]._id : users[0]._id,
        details: 'Policy coverage amount updated',
        ipAddress: '192.168.1.101'
      },
      {
        action: 'CLAIM_REJECTED',
        userId: users[2] ? users[2]._id : users[0]._id,
        details: 'Claim #12346 rejected due to insufficient documentation',
        ipAddress: '192.168.1.102'
      },
      {
        action: 'LOGOUT',
        userId: users[0]._id,
        details: `User ${users[0].name} logged out`,
        ipAddress: '192.168.1.100'
      }
    ];

    // Create logs with different timestamps (spread over last 7 days)
    const auditLogs = sampleLogs.map((log, index) => ({
      ...log,
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Each log is 1 day older
    }));

    await AuditLog.insertMany(auditLogs);
    console.log(`Successfully seeded ${auditLogs.length} audit logs.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding audit logs:', error);
    process.exit(1);
  }
};

seedAuditLogs();







