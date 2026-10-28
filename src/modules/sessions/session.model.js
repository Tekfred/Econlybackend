const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accessTokenHash: { type: String, required: true, unique: true, select: false },
    refreshTokenHash: { type: String, required: true, unique: true, select: false },
    accessExpiresAt: { type: Date, required: true },
    refreshExpiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Session', sessionSchema);
