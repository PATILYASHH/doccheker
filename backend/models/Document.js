import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    case_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    file_name: {
      type: String,
      required: [true, "File name is required"],
    },
    file_path: {
      type: String,
      required: [true, "File path is required"],
    },
    file_url: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
documentSchema.index({ case_id: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
