import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    lawyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    case_number: {
      type: String,
      required: [true, "Case number is required"],
      unique: true,
    },
    case_title: {
      type: String,
      required: [true, "Case title is required"],
    },
    client_name: {
      type: String,
      required: [true, "Client name is required"],
    },
    court_name: {
      type: String,
      required: [true, "Court name is required"],
    },
    case_type: {
      type: String,
      required: [true, "Case type is required"],
    },
    filing_date: {
      type: Date,
      required: [true, "Filing date is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Closed", "On Hold"],
      default: "Pending",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
caseSchema.index({ lawyer_id: 1, created_at: -1 });

const Case = mongoose.model("Case", caseSchema);

export default Case;
