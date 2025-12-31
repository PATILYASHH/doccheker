import express from "express";
import { body, validationResult } from "express-validator";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// @route   GET /api/cases
// @desc    Get all cases for authenticated user
// @access  Private
router.get("/", async (req, res) => {
  try {
    const cases = await Case.find({ lawyer_id: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error("Get cases error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cases",
    });
  }
});

// @route   GET /api/cases/:id
// @desc    Get single case by ID
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      data: caseData,
    });
  } catch (error) {
    console.error("Get case error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching case",
    });
  }
});

// @route   POST /api/cases
// @desc    Create new case
// @access  Private
router.post(
  "/",
  [
    body("case_number")
      .trim()
      .notEmpty()
      .withMessage("Case number is required"),
    body("case_title").trim().notEmpty().withMessage("Case title is required"),
    body("client_name")
      .trim()
      .notEmpty()
      .withMessage("Client name is required"),
    body("court_name").trim().notEmpty().withMessage("Court name is required"),
    body("case_type").trim().notEmpty().withMessage("Case type is required"),
    body("filing_date").notEmpty().withMessage("Filing date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const caseData = await Case.create({
        ...req.body,
        lawyer_id: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "Case created successfully",
        data: caseData,
      });
    } catch (error) {
      console.error("Create case error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Case number already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating case",
      });
    }
  }
);

// @route   PUT /api/cases/:id
// @desc    Update case
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const caseData = await Case.findOneAndUpdate(
      {
        _id: req.params.id,
        lawyer_id: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case updated successfully",
      data: caseData,
    });
  } catch (error) {
    console.error("Update case error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating case",
    });
  }
});

// @route   DELETE /api/cases/:id
// @desc    Delete case
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const caseData = await Case.findOneAndDelete({
      _id: req.params.id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    console.error("Delete case error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting case",
    });
  }
});

export default router;
