# 🏥 Insurance Policy Management System - Complete Workflow Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Angular 18)"
        A[Home Page] --> B[Authentication]
        B --> C[Customer Dashboard]
        B --> D[Agent Dashboard] 
        B --> E[Admin Dashboard]
        
        C --> F[Browse Policies]
        C --> G[My Policies]
        C --> H[Submit Claims]
        C --> I[Payments]
        
        D --> J[Manage Customers]
        D --> K[Process Claims]
        D --> L[Performance Reports]
        
        E --> M[User Management]
        E --> N[Policy Management]
        E --> O[Audit Logs]
        E --> P[System Analytics]
    end
    
    subgraph "Backend (Node.js/Express)"
        Q[REST API v1] --> R[Authentication Service]
        Q --> S[Policy Service]
        Q --> T[Claim Service]
        Q --> U[Payment Service]
        Q --> V[Admin Service]
        Q --> W[Agent Service]
        
        R --> X[JWT Middleware]
        S --> Y[Policy Controller]
        T --> Z[Claim Controller]
        U --> AA[Payment Controller]
        V --> BB[Admin Controller]
        W --> CC[Agent Controller]
    end
    
    subgraph "Database (MongoDB)"
        DD[Users Collection]
        EE[PolicyProducts Collection]
        FF[UserPolicies Collection]
        GG[Claims Collection]
        HH[Payments Collection]
        II[AuditLogs Collection]
    end
    
    A --> Q
    Q --> DD
    Q --> EE
    Q --> FF
    Q --> GG
    Q --> HH
    Q --> II
```

## Complete User Workflow

### 1. Customer Journey

```mermaid
flowchart TD
    A[Customer Visits Home] --> B{Authenticated?}
    B -->|No| C[Register/Login]
    B -->|Yes| D[Customer Dashboard]
    
    C --> E[Registration Form]
    E --> F[Email Verification]
    F --> G[Login]
    G --> D
    
    D --> H[Browse Available Policies]
    H --> I[View Policy Details]
    I --> J[Purchase Policy]
    J --> K[Payment Processing]
    K --> L[Policy Activated]
    
    L --> M[View My Policies]
    M --> N[File Claim if Needed]
    N --> O[Track Claim Status]
    
    D --> P[Update Profile]
    D --> Q[View Payment History]
    D --> R[Contact Support]
```

### 2. Agent Workflow

```mermaid
flowchart TD
    A[Agent Login] --> B[Agent Dashboard]
    B --> C[View Assigned Customers]
    C --> D[Customer Profile Management]
    D --> E[Policy Recommendations]
    
    B --> F[Claims Processing]
    F --> G[Review Claim Details]
    G --> H{Claim Valid?}
    H -->|Yes| I[Approve Claim]
    H -->|No| J[Reject Claim]
    I --> K[Update Claim Status]
    J --> K
    
    B --> L[Performance Analytics]
    L --> M[Customer Communication]
    M --> N[Send Messages/Notifications]
    
    B --> O[View All Claims]
    O --> P[Filter by Status]
    P --> Q[Process Claims]
```

### 3. Admin Workflow

```mermaid
flowchart TD
    A[Admin Login] --> B[Admin Dashboard]
    B --> C[System Overview]
    C --> D[User Management]
    D --> E[Create/Edit Users]
    D --> F[Assign Agents to Customers]
    
    B --> G[Policy Management]
    G --> H[Create New Policies]
    G --> I[Edit Existing Policies]
    G --> J[Deactivate Policies]
    
    B --> K[Audit & Monitoring]
    K --> L[View Audit Logs]
    K --> M[System Analytics]
    K --> N[Revenue Reports]
    
    B --> O[Claims Oversight]
    O --> P[View All Claims]
    O --> Q[Override Claim Decisions]
    O --> R[Generate Reports]
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend API
    participant D as Database
    participant A as Agent
    participant AD as Admin
    
    Note over C,AD: Policy Purchase Flow
    C->>F: Browse Policies
    F->>B: GET /api/v1/policies
    B->>D: Query PolicyProducts
    D-->>B: Return Policies
    B-->>F: Policy List
    F-->>C: Display Policies
    
    C->>F: Purchase Policy
    F->>B: POST /api/v1/policies/{id}/purchase
    B->>D: Create UserPolicy
    B->>D: Create Payment
    B->>D: Assign Agent
    B-->>F: Success Response
    F-->>C: Policy Purchased
    
    Note over C,AD: Claim Processing Flow
    C->>F: Submit Claim
    F->>B: POST /api/v1/claims
    B->>D: Create Claim
    B->>A: Notify Assigned Agent
    A->>F: Review Claim
    F->>B: PATCH /api/v1/claims/{id}/status
    B->>D: Update Claim Status
    B-->>F: Updated Claim
    F-->>C: Claim Status Updated
```

## System Components & Technologies

### Frontend Stack
- **Framework**: Angular 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: RxJS Observables
- **Routing**: Angular Router with Guards
- **Authentication**: JWT Token Management

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **API**: RESTful API (v1)
- **Additional**: GraphQL Support

### Database Schema
- **Users**: Customer, Agent, Admin roles
- **PolicyProducts**: Insurance policy templates
- **UserPolicies**: Customer-purchased policies
- **Claims**: Insurance claims with status tracking
- **Payments**: Payment records and history
- **AuditLogs**: System activity tracking

## Key Features & Capabilities

### Customer Features
- ✅ User Registration & Authentication
- ✅ Policy Browsing & Purchase
- ✅ Policy Management (View, Cancel)
- ✅ Claim Submission & Tracking
- ✅ Payment History
- ✅ Profile Management
- ✅ Real-time Notifications

### Agent Features
- ✅ Customer Management
- ✅ Claim Processing & Approval
- ✅ Performance Analytics
- ✅ Customer Communication
- ✅ Policy Recommendations
- ✅ Dashboard Analytics

### Admin Features
- ✅ Complete User Management
- ✅ Policy Creation & Management
- ✅ System-wide Analytics
- ✅ Audit Log Monitoring
- ✅ Revenue Tracking
- ✅ Agent Performance Management

## Security & Access Control

```mermaid
graph LR
    A[User Request] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D{Valid Token?}
    D -->|No| E[Token Expired/Invalid]
    D -->|Yes| F{Authorized Role?}
    F -->|No| G[Access Denied]
    F -->|Yes| H[Allow Access]
    
    E --> I[Refresh Token]
    I --> J{Valid Refresh?}
    J -->|Yes| K[New Token Issued]
    J -->|No| C
    K --> H
```

## API Endpoints Summary

### Public Endpoints
- `GET /api/v1/policies` - List all policies
- `GET /api/v1/policies/:id` - Get policy details
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Protected Endpoints (Customer)
- `GET /api/v1/user/policies` - Get user's policies
- `POST /api/v1/policies/:id/purchase` - Purchase policy
- `POST /api/v1/claims` - Submit claim
- `GET /api/v1/claims` - Get user's claims
- `PUT /api/v1/user/policies/:id/cancel` - Cancel policy

### Agent Endpoints
- `GET /api/v1/agents/claims` - Get assigned claims
- `PATCH /api/v1/claims/:id/status` - Update claim status
- `GET /api/v1/agents/customers` - Get assigned customers
- `GET /api/v1/agents/performance` - Get performance data

### Admin Endpoints
- `POST /api/v1/policies` - Create policy
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/audit` - Get audit logs
- `GET /api/v1/admin/summary` - Get system summary

## Testing & Quality Assurance

- ✅ **266 Test Cases** - Comprehensive test coverage
- ✅ **100% Test Success Rate** - All tests passing
- ✅ **Component Testing** - Angular component tests
- ✅ **Service Testing** - API service tests
- ✅ **Integration Testing** - End-to-end workflows
- ✅ **Error Handling** - Comprehensive error management

## Deployment & Scalability

### Development Setup
1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm start`
3. **Database**: MongoDB running on localhost:27017
4. **Access**: Frontend on http://localhost:4200, Backend on http://localhost:5000

### Production Considerations
- Environment-based configuration
- Database connection pooling
- JWT secret management
- CORS configuration
- Error logging and monitoring
- API rate limiting
- Data backup strategies

---

**This comprehensive workflow diagram covers all aspects of your Insurance Policy Management System, from user interactions to database operations, making it perfect for presentations and documentation.**
