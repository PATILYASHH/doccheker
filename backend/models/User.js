import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified or new
  if (!this.isModified("password")) return next();

  // Don't hash if using Google auth (no password)
  if (this.authProvider === "google" && !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Method to get public user data (without password)
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    authProvider: this.authProvider,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
