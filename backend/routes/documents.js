import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Document from "../models/Document.js";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Create uploads directory if it doesn't exist
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only documents and images are allowed"));
    }
  },
});

// @route   GET /api/documents/case/:caseId
// @desc    Get all documents for a case
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

    const documents = await Document.find({ case_id: req.params.caseId })
      .sort({ createdAt: -1 })
      .populate("uploaded_by", "name email");

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
    });
  }
});

// @route   POST /api/documents
// @desc    Upload document
// @access  Private
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const { case_id } = req.body;

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      // Delete uploaded file if case not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const document = await Document.create({
      case_id,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_url: `/uploads/${req.file.filename}`,
      file_size: req.file.size,
      uploaded_by: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    // Delete file if database operation failed
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error uploading document",
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: document.case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
    });
  }
});

export default router;
