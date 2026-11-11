const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 20 },
    dateOfBirth: { type: Date, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    passwordResetCodeHash: { type: String, select: false },
    passwordResetCodeExpiresAt: { type: Date, select: false },
    passwordResetCodeAttempts: { type: Number, default: 0, select: false },
    passwordResetRequestedAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetTokenExpiresAt: { type: Date, select: false },
    emailSignInCodeHash: { type: String, select: false },
    emailSignInCodeExpiresAt: { type: Date, select: false },
    emailSignInCodeAttempts: { type: Number, default: 0, select: false },
    emailSignInRequestedAt: { type: Date, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
