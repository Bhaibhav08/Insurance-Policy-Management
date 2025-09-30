const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const authMiddleware = require("./middlewares/auth");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// REST Routes - v1 API structure
const authRoutes = require("./routes/auth");
const policyRoutes = require("./routes/policy");
const userPolicyRoutes = require("./routes/userPolicy");
const claimRoutes = require("./routes/claim");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const agentRoutes = require("./routes/agent");
const notificationRoutes = require("./routes/notification");
const messageRoutes = require("./routes/message");
const userRoutes = require("./routes/user");
const feedbackRoutes = require("./routes/feedback");
const supportRoutes = require("./routes/support");

// v1 API endpoints
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/policies", policyRoutes); // public GET, admin POST protected via handler
app.use("/api/v1/user/policies", authMiddleware, userPolicyRoutes);
app.use("/api/v1/claims", authMiddleware, claimRoutes);
app.use("/api/v1/payments", authMiddleware, paymentRoutes);
app.use("/api/v1/admin", authMiddleware, adminRoutes);
app.use("/api/v1/agents", authMiddleware, agentRoutes);
app.use("/api/v1/notifications", authMiddleware, notificationRoutes);
app.use("/api/v1/messages", authMiddleware, messageRoutes);
app.use("/api/v1/users", authMiddleware, userRoutes);
app.use("/api/v1/feedback", authMiddleware, feedbackRoutes);
app.use("/api/v1/support", authMiddleware, supportRoutes);

// Legacy API support (for backward compatibility)
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/user-policies", authMiddleware, userPolicyRoutes);
app.use("/api/claims", authMiddleware, claimRoutes);
app.use("/api/payments", authMiddleware, paymentRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

// GraphQL setup with auth context
async function startApollo() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const header = req.headers.authorization || "";
      const token = header.replace("Bearer ", "");
      if (!token) return { user: null };
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        return { user: { id: decoded.id, role: decoded.role } };
      } catch (e) {
        return { user: null };
      }
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
}

// Start server
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await startApollo();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();
