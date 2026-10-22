import mongoose from "mongoose";

const registerOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

registerOtpSchema.index({ email: 1 }, { unique: true });
registerOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RegisterOtp = mongoose.model("RegisterOtp", registerOtpSchema);
