import express from "express";
import { body, validationResult } from "express-validator";
import Speech from "../models/Speech.js";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/speeches/case/:caseId
// @desc    Get all speeches for a case
// @access  Private
router.get("/case/:caseId", async (req, res) => {
  try {
    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: req.params.caseId,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const speeches = await Speech.find({ case_id: req.params.caseId })
      .sort({ updatedAt: -1 })
      .populate("created_by", "name email");

    res.json({
      success: true,
      data: speeches,
    });
  } catch (error) {
    console.error("Get speeches error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching speeches",
    });
  }
});

// @route   POST /api/speeches
// @desc    Create new speech
// @access  Private
router.post(
  "/",
  [
    body("case_id").notEmpty().withMessage("Case ID is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
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

      // Verify case belongs to user
      const caseData = await Case.findOne({
        _id: req.body.case_id,
        lawyer_id: req.user._id,
      });

      if (!caseData) {
        return res.status(404).json({
          success: false,
          message: "Case not found",
        });
      }

      const speech = await Speech.create({
        ...req.body,
        created_by: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "Speech created successfully",
        data: speech,
      });
    } catch (error) {
      console.error("Create speech error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating speech",
      });
    }
  }
);

// @route   PUT /api/speeches/:id
// @desc    Update speech
// @access  Private
router.put(
  "/:id",
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Content cannot be empty"),
  ],
  async (req, res) => {
    try {
      const speech = await Speech.findById(req.params.id);

      if (!speech) {
        return res.status(404).json({
          success: false,
          message: "Speech not found",
        });
      }

      // Verify case belongs to user
      const caseData = await Case.findOne({
        _id: speech.case_id,
        lawyer_id: req.user._id,
      });

      if (!caseData) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      const updatedSpeech = await Speech.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Speech updated successfully",
        data: updatedSpeech,
      });
    } catch (error) {
      console.error("Update speech error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating speech",
      });
    }
  }
);

// @route   DELETE /api/speeches/:id
// @desc    Delete speech
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const speech = await Speech.findById(req.params.id);

    if (!speech) {
      return res.status(404).json({
        success: false,
        message: "Speech not found",
      });
    }

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: speech.case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await speech.deleteOne();

    res.json({
      success: true,
      message: "Speech deleted successfully",
    });
  } catch (error) {
    console.error("Delete speech error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting speech",
    });
  }
});

export default router;
