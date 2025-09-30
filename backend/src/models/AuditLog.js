const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT', 
            'POLICY_CREATED',
            'POLICY_UPDATED',
            'POLICY_CANCELLED',
            'CLAIM_CREATED',
            'CLAIM_UPDATED',
            'CLAIM_APPROVED',
            'CLAIM_REJECTED',
            'AGENT_ASSIGNED',
            'USER_CREATED',
            'USER_UPDATED',
            'USER_ACTIVATED',
            'USER_DEACTIVATED',
            'PAYMENT_PROCESSED'
        ]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    details: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        default: 'Unknown'
    },
    createdAt: {
        type: Date, 
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
schema.index({ action: 1 });
schema.index({ userId: 1 });
schema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', schema);