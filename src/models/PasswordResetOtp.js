import mongoose from 'mongoose';

const passwordResetOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetOtpSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('PasswordResetOtp', passwordResetOtpSchema);
