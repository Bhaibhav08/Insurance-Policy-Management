# 🚀 Insurance Management System - Complete Integration Guide

## ✅ Issues Fixed

### 1. **API Endpoint Mismatches**
- ✅ Fixed `purchasePolicy` endpoint: `/user-policies/purchase` → `/policies/{id}/purchase`
- ✅ Fixed `getUserPolicies` endpoint: `/user-policies/my-policies` → `/user/policies`
- ✅ Updated backend routes to match frontend expectations

### 2. **Backend Response Format**
- ✅ Standardized all API responses to include `success` and `data` fields
- ✅ Added proper error handling with consistent response format
- ✅ Updated UserPolicy, Claim, and Policy routes

### 3. **Frontend-Backend Data Flow**
- ✅ Fixed policy purchase to create UserPolicy records in MongoDB
- ✅ Fixed "My Policies" section to display purchased policies
- ✅ Fixed claims submission with correct field mapping
- ✅ Added proper error handling and loading states

### 4. **Database Integration**
- ✅ UserPolicy records are now properly created when purchasing policies
- ✅ Claims are linked to UserPolicy records
- ✅ All data persists in MongoDB as expected

## 🔧 How to Run the Complete System

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=mongodb://localhost:27017/insurance_management
# JWT_SECRET=your_super_secret_jwt_key_here
# PORT=5000
# FRONTEND_URL=http://localhost:4200
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
```bash
cd backend
npm run seed  # This will populate sample policies
```

## 🎯 Complete User Flow

### 1. **User Registration & Login**
- User registers with name, email, password
- JWT token is generated and stored
- User can login and access protected routes

### 2. **Browse & Purchase Policies**
- User can view all available policies from backend
- User can purchase a policy with nominee details
- UserPolicy record is created in MongoDB
- Payment record is automatically created

### 3. **View My Policies**
- User can see all their purchased policies
- Policies show status (ACTIVE, CANCELLED, EXPIRED)
- Policy details include premium, dates, nominee info

### 4. **Submit Claims**
- User can file claims on their active policies
- Claims are linked to UserPolicy records
- Claims show status (PENDING, APPROVED, REJECTED)

### 5. **Admin/Agent Features**
- Admins can create new policies
- Agents can review and approve/reject claims
- Full audit logging of all activities

## 🔗 API Endpoints

### Public Endpoints
- `GET /api/v1/policies` - List all policies
- `GET /api/v1/policies/:id` - Get policy details
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Protected Endpoints (Require Authentication)
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/user/policies` - Get user's policies
- `POST /api/v1/policies/:id/purchase` - Purchase policy
- `POST /api/v1/claims` - Submit claim
- `GET /api/v1/claims` - Get user's claims
- `PUT /api/v1/user/policies/:id/cancel` - Cancel policy

### Admin/Agent Endpoints
- `POST /api/v1/policies` - Create policy (Admin)
- `PUT /api/v1/claims/:id/status` - Update claim status (Agent/Admin)
- `GET /api/v1/admin/summary` - Dashboard KPIs (Admin)
- `GET /api/v1/admin/audit` - Audit logs (Admin)

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: 'customer' | 'agent' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

### PolicyProduct Model
```javascript
{
  code: String (unique),
  title: String,
  description: String,
  premium: Number,
  termMonths: Number,
  minSumInsured: Number,
  createdAt: Date
}
```

### UserPolicy Model
```javascript
{
  userId: ObjectId (ref: User),
  policyProductId: ObjectId (ref: PolicyProduct),
  startDate: Date,
  endDate: Date,
  premiumPaid: Number,
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
  assignedAgentId: ObjectId (ref: User),
  nominee: {
    name: String,
    relation: String
  },
  createdAt: Date
}
```

### Claim Model
```javascript
{
  userId: ObjectId (ref: User),
  userPolicyId: ObjectId (ref: UserPolicy),
  incidentDate: Date,
  description: String,
  amountClaimed: Number,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  decisionNotes: String,
  decidedByAgentId: ObjectId (ref: User),
  createdAt: Date
}
```

### Payment Model
```javascript
{
  userId: ObjectId (ref: User),
  userPolicyId: ObjectId (ref: UserPolicy),
  amount: Number,
  method: 'CARD' | 'NETBANKING' | 'OFFLINE' | 'SIMULATED',
  reference: String,
  createdAt: Date
}
```

## 🧪 Testing the Integration

### 1. **Test User Registration**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"customer"}'
```

### 2. **Test Policy Purchase**
```bash
curl -X POST http://localhost:5000/api/v1/policies/{policyId}/purchase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"startDate":"2024-01-01","termMonths":12,"nominee":{"name":"John Doe","relation":"Son"}}'
```

### 3. **Test Get User Policies**
```bash
curl -X GET http://localhost:5000/api/v1/user/policies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. **Test Submit Claim**
```bash
curl -X POST http://localhost:5000/api/v1/claims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"policyId":"USER_POLICY_ID","incidentDate":"2024-01-15","description":"Car accident","amount":50000}'
```

## 🎉 What's Working Now

1. ✅ **Complete Frontend-Backend Integration**
2. ✅ **Policy Purchase Creates Database Records**
3. ✅ **My Policies Shows Purchased Policies**
4. ✅ **Claims System Fully Functional**
5. ✅ **Real-time Data Persistence in MongoDB**
6. ✅ **Proper Error Handling & Loading States**
7. ✅ **JWT Authentication & Authorization**
8. ✅ **Role-based Access Control**

## 🚀 Next Steps

1. **Start the backend**: `cd backend && npm run dev`
2. **Start the frontend**: `cd frontend && npm start`
3. **Register a new user** in the frontend
4. **Browse and purchase a policy**
5. **Check "My Policies" section** - you should see your purchased policy
6. **File a claim** on your active policy
7. **View your claims** in the claims section

Your insurance management system is now fully integrated and working! 🎊

