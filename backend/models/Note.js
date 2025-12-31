import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    case_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
    },
    created_by: {
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
noteSchema.index({ case_id: 1, updatedAt: -1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
