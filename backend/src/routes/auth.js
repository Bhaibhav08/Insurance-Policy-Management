const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role, phone, dateOfBirth } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Validate role
  const validRoles = ['customer', 'agent', 'admin'];
  const userRole = role || 'customer';
  if (!validRoles.includes(userRole)) {
    return res.status(400).json({ message: "Invalid role. Must be customer, agent, or admin" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashed, 
      role: userRole,
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      kycStatus: 'pending',
      isActive: true
    });
    await user.save();

    // Log the user creation
    await AuditLog.create({
      action: 'USER_CREATED',
      userId: user._id,
      details: `New ${user.role} user ${user.name} (${user.email}) registered successfully`,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    
    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      token, 
      user: userResponse 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive) {
      return res.status(400).json({ message: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    
    // Log the login action
    await AuditLog.create({
      action: 'LOGIN',
      userId: user._id,
      details: `User ${user.name} (${user.email}) logged in successfully`,
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
    });
    
    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
    
    res.json({ 
      success: true,
      message: "Login successful",
      token, 
      user: userResponse 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      success: true,
      user 
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    const newToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    
    res.json({ 
      success: true,
      token: newToken 
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Logout (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({ 
    success: true,
    message: "Logged out successfully" 
  });
});

module.exports = router;
