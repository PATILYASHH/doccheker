import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import casesRoutes from "./routes/cases.js";
import documentsRoutes from "./routes/documents.js";
import notesRoutes from "./routes/notes.js";
import speechesRoutes from "./routes/speeches.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/speeches", speechesRoutes);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
