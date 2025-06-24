import mongoose from "mongoose";

const verifiedEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: String,
    },
  },
  { timestamps: true }
);

const VerifiedEmail = mongoose.model("VerifiedEmail", verifiedEmailSchema);
export default VerifiedEmail;
