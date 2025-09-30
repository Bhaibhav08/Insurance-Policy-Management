# 🏥 Insurance Policy Management System

A comprehensive full-stack web application for managing insurance policies, claims, and user interactions. Built with Angular frontend and Node.js/Express backend.

## 🚀 Features

### **Frontend (Angular)**
- **User Authentication**: Login/Register with role-based access control
- **Dashboard**: Personalized dashboards for different user roles
- **Policy Management**: Browse, purchase, and manage insurance policies
- **Claims Processing**: File and track insurance claims
- **Payment System**: Secure payment processing
- **Admin Panel**: Complete administrative controls
- **Agent Dashboard**: Specialized interface for insurance agents
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### **Backend (Node.js/Express)**
- **RESTful API**: Complete API endpoints for all operations
- **Authentication**: JWT-based authentication system
- **Database**: MongoDB with Mongoose ODM
- **Role-based Access**: Admin, Agent, and Customer roles
- **Audit Logging**: Complete activity tracking
- **Data Validation**: Comprehensive input validation

## 🛠️ Tech Stack

### **Frontend**
- Angular 18
- TypeScript
- Tailwind CSS
- RxJS
- Angular Material (optional)

### **Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/insurance-policy-management.git
cd insurance-policy-management
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/insurance_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
```

### **4. Start the Application**

**Option 1: Using the provided script**
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
ng serve
```

## 🧪 Testing

The project includes a comprehensive test suite with **266 tests** covering all components and services.

### **Run Tests**
```bash
cd frontend
npm test
```

### **Test Coverage**
- ✅ All 266 tests passing
- ✅ 100% test success rate
- ✅ Component testing
- ✅ Service testing
- ✅ Integration testing

## 📁 Project Structure

```
insurance-policy-management/
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── config/          # Configuration files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/       # Angular components
│   │   │   ├── services/    # Angular services
│   │   │   └── models/      # TypeScript models
│   │   └── assets/          # Static assets
│   └── package.json
└── README.md
```

## 🔐 User Roles

### **Admin**
- Manage all users and policies
- View system analytics
- Handle audit logs
- Create and modify policies

### **Agent**
- Manage assigned customers
- Process claims
- View performance reports
- Handle customer queries

### **Customer**
- Browse and purchase policies
- File claims
- View policy details
- Make payments

## 🚀 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### **Policies**
- `GET /api/policies` - Get all policies
- `POST /api/policies` - Create new policy
- `GET /api/policies/:id` - Get policy by ID

### **Claims**
- `GET /api/claims` - Get all claims
- `POST /api/claims` - Create new claim
- `PUT /api/claims/:id` - Update claim status

### **Users**
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

## 🎯 Key Features Implemented

- ✅ **Complete Authentication System**
- ✅ **Role-based Access Control**
- ✅ **Policy Management**
- ✅ **Claims Processing**
- ✅ **Payment Integration**
- ✅ **Admin Dashboard**
- ✅ **Agent Interface**
- ✅ **Responsive Design**
- ✅ **Comprehensive Testing**
- ✅ **API Documentation**

## 🐛 Bug Fixes & Improvements

This project has been thoroughly tested and debugged:
- Fixed all 7 initial test failures
- Implemented proper test isolation
- Added comprehensive error handling
- Optimized component performance
- Enhanced user experience

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Bhaibhav Raj**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**⭐ Star this repository if you found it helpful!**
