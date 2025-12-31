import express from "express";
import { body, validationResult } from "express-validator";
import Note from "../models/Note.js";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/notes/case/:caseId
// @desc    Get all notes for a case
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

    const notes = await Note.find({ case_id: req.params.caseId })
      .sort({ updatedAt: -1 })
      .populate("created_by", "name email");

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notes",
    });
  }
});

// @route   POST /api/notes
// @desc    Create new note
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

      const note = await Note.create({
        ...req.body,
        created_by: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "Note created successfully",
        data: note,
      });
    } catch (error) {
      console.error("Create note error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating note",
      });
    }
  }
);

// @route   PUT /api/notes/:id
// @desc    Update note
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
      const note = await Note.findById(req.params.id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      // Verify case belongs to user
      const caseData = await Case.findOne({
        _id: note.case_id,
        lawyer_id: req.user._id,
      });

      if (!caseData) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Note updated successfully",
        data: updatedNote,
      });
    } catch (error) {
      console.error("Update note error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating note",
      });
    }
  }
);

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: note.case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting note",
    });
  }
});

export default router;
