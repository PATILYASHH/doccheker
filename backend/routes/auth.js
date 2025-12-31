import express from "express";
import { body, validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { protect, generateToken } from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        authProvider: "local",
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating user",
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if user registered with Google
      if (user.authProvider === "google" && !user.password) {
        return res.status(400).json({
          success: false,
          message:
            "This account was created with Google. Please sign in with Google.",
        });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Error logging in",
      });
    }
  }
);

// @route   POST /api/auth/google
// @desc    Google OAuth authentication
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if user exists with same email but no Google ID
      if (!user.googleId && user.email === email) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || "",
        authProvider: "google",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Google authentication successful",
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Error authenticating with Google",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post("/refresh", protect, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user._id);

    res.json({
      success: true,
      token,
      user: req.user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
    });
  }
});

export default router;
