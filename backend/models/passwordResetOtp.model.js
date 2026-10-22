import mongoose from "mongoose";

const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordResetOtpSchema.index({ email: 1, role: 1 }, { unique: true });
passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetOtp = mongoose.model("PasswordResetOtp", passwordResetOtpSchema);
