import mongoose from "mongoose";

const speechSchema = new mongoose.Schema(
  {
    case_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Speech title is required"],
    },
    content: {
      type: String,
      required: [true, "Speech content is required"],
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
speechSchema.index({ case_id: 1, updatedAt: -1 });

const Speech = mongoose.model("Speech", speechSchema);

export default Speech;
