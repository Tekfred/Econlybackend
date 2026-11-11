const bcrypt = require('bcrypt');
const { createHash, randomBytes, randomInt } = require('node:crypto');
const env = require('../../config/env');
const User = require('./user.model');
const sessionService = require('../sessions/session.service');
const emailService = require('./email.service');

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function toUserResponse(user) {
  const firstName = user.firstName || user.fullName?.split(/\s+/)[0] || '';
  const lastName = user.lastName || user.fullName?.split(/\s+/).slice(1).join(' ') || '';

  return {
    _id: user._id.toString(),
    firstName,
    lastName,
    fullName: user.fullName || [firstName, lastName].filter(Boolean).join(' '),
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10),
    email: user.email,
  };
}

async function register({ firstName, lastName, phoneNumber, dateOfBirth, email, password }) {
  try {
    const user = await User.create({
      firstName,
      lastName,
      fullName: [firstName, lastName].join(' '),
      phoneNumber,
      dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
    });

    return { user: toUserResponse(user) };
  } catch (error) {
    // The unique MongoDB index is the source of truth, including concurrent requests.
    if (error.code === 11000 && error.keyPattern?.email) {
      const conflict = new Error('An account with this email already exists.');
      conflict.statusCode = 409;
      conflict.code = 'EMAIL_ALREADY_REGISTERED';
      throw conflict;
    }
    throw error;
  }
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const isValid = user && await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Email or password is incorrect.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const tokens = await sessionService.createSession(user._id);
  return {
    ...tokens,
    user: toUserResponse(user),
  };
}

async function logout(sessionId) {
  return sessionService.revokeSession(sessionId);
}

const GENERIC_RESET_MESSAGE =
  'If an account with that email exists, a reset code has been sent.';
const RESET_CODE_COOLDOWN_MS = 60 * 1000;
const RESET_CODE_MAX_ATTEMPTS = 5;
const GENERIC_SIGN_IN_CODE_MESSAGE =
  'If an account with that email exists, a sign-in code has been sent.';

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function invalidResetCodeError() {
  const error = new Error('The reset code is invalid or expired. Request a new code.');
  error.statusCode = 400;
  error.code = 'INVALID_OR_EXPIRED_RESET_CODE';
  return error;
}

function invalidResetTokenError() {
  const error = new Error('The reset session is invalid or expired. Start again.');
  error.statusCode = 400;
  error.code = 'INVALID_OR_EXPIRED_RESET_TOKEN';
  return error;
}

function clearResetCode(user) {
  user.passwordResetCodeHash = null;
  user.passwordResetCodeExpiresAt = null;
  user.passwordResetCodeAttempts = 0;
}

async function requestPasswordReset({ email }) {
  const genericResponse = { message: GENERIC_RESET_MESSAGE };
  if (env.nodeEnv === 'production' && !emailService.isConfigured()) {
    const error = new Error('Password recovery email is not configured.');
    error.statusCode = 503;
    error.code = 'EMAIL_SERVICE_UNAVAILABLE';
    throw error;
  }

  const user = await User.findOne({ email }).select('+passwordResetRequestedAt');
  if (!user) return genericResponse;

  const now = new Date();
  const lastRequestedAt = user.passwordResetRequestedAt?.getTime();
  if (lastRequestedAt && now.getTime() - lastRequestedAt < RESET_CODE_COOLDOWN_MS) {
    return genericResponse;
  }

  const code = String(randomInt(1000, 10000));
  user.passwordResetCodeHash = await bcrypt.hash(code, SALT_ROUNDS);
  user.passwordResetCodeExpiresAt = new Date(
    now.getTime() + env.passwordResetOtpTtlMinutes * 60 * 1000,
  );
  user.passwordResetCodeAttempts = 0;
  user.passwordResetRequestedAt = now;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
  await user.save();

  try {
    await emailService.sendPasswordResetCode({
      email: user.email,
      code,
      expiresInMinutes: env.passwordResetOtpTtlMinutes,
    });
  } catch (error) {
    // Keep the HTTP response indistinguishable for registered/unregistered emails.
    console.error('Password reset email delivery failed:', error.message);
  }

  return genericResponse;
}

async function verifyPasswordResetOtp({ email, code }) {
  const user = await User.findOne({ email }).select(
    '+passwordResetCodeHash +passwordResetCodeExpiresAt +passwordResetCodeAttempts',
  );
  if (!user) throw invalidResetCodeError();

  if (
    !user.passwordResetCodeHash ||
    !user.passwordResetCodeExpiresAt ||
    user.passwordResetCodeExpiresAt <= new Date()
  ) {
    clearResetCode(user);
    await user.save();
    throw invalidResetCodeError();
  }

  user.passwordResetCodeAttempts = (user.passwordResetCodeAttempts || 0) + 1;
  const matches = await bcrypt.compare(code, user.passwordResetCodeHash);
  if (!matches) {
    if (user.passwordResetCodeAttempts >= RESET_CODE_MAX_ATTEMPTS) {
      clearResetCode(user);
    }
    await user.save();
    throw invalidResetCodeError();
  }

  const resetToken = randomBytes(32).toString('base64url');
  user.passwordResetTokenHash = hashResetToken(resetToken);
  user.passwordResetTokenExpiresAt = new Date(
    Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000,
  );
  clearResetCode(user);
  await user.save();
  return { resetToken };
}

function clearEmailSignInCode(user) {
  user.emailSignInCodeHash = null;
  user.emailSignInCodeExpiresAt = null;
  user.emailSignInCodeAttempts = 0;
}

function invalidEmailSignInCodeError() {
  const error = new Error('The sign-in code is invalid or expired. Request a new code.');
  error.statusCode = 400;
  error.code = 'INVALID_OR_EXPIRED_SIGN_IN_CODE';
  return error;
}

async function requestEmailSignInCode({ email }) {
  const genericResponse = { message: GENERIC_SIGN_IN_CODE_MESSAGE };
  if (env.nodeEnv === 'production' && !emailService.isConfigured()) {
    const error = new Error('Email sign-in delivery is not configured.');
    error.statusCode = 503;
    error.code = 'EMAIL_SERVICE_UNAVAILABLE';
    throw error;
  }

  const user = await User.findOne({ email }).select('+emailSignInRequestedAt');
  if (!user) return genericResponse;

  const now = new Date();
  const lastRequestedAt = user.emailSignInRequestedAt?.getTime();
  if (lastRequestedAt && now.getTime() - lastRequestedAt < RESET_CODE_COOLDOWN_MS) {
    return genericResponse;
  }

  const code = String(randomInt(1000, 10000));
  user.emailSignInCodeHash = await bcrypt.hash(code, SALT_ROUNDS);
  user.emailSignInCodeExpiresAt = new Date(
    now.getTime() + env.passwordResetOtpTtlMinutes * 60 * 1000,
  );
  user.emailSignInCodeAttempts = 0;
  user.emailSignInRequestedAt = now;
  await user.save();

  try {
    await emailService.sendEmailSignInCode({
      email: user.email,
      code,
      expiresInMinutes: env.passwordResetOtpTtlMinutes,
    });
  } catch (error) {
    console.error('Email sign-in code delivery failed:', error.message);
  }

  return genericResponse;
}

async function verifyEmailSignInCode({ email, code }) {
  const user = await User.findOne({ email }).select(
    '+emailSignInCodeHash +emailSignInCodeExpiresAt +emailSignInCodeAttempts',
  );
  if (
    !user ||
    !user.emailSignInCodeHash ||
    !user.emailSignInCodeExpiresAt ||
    user.emailSignInCodeExpiresAt <= new Date()
  ) {
    throw invalidEmailSignInCodeError();
  }

  user.emailSignInCodeAttempts = (user.emailSignInCodeAttempts || 0) + 1;
  const matches = await bcrypt.compare(code, user.emailSignInCodeHash);
  if (!matches) {
    if (user.emailSignInCodeAttempts >= RESET_CODE_MAX_ATTEMPTS) {
      clearEmailSignInCode(user);
    }
    await user.save();
    throw invalidEmailSignInCodeError();
  }

  clearEmailSignInCode(user);
  await user.save();
  const tokens = await sessionService.createSession(user._id);
  return { ...tokens, user: toUserResponse(user) };
}

async function resetPassword({ resetToken, newPassword }) {
  const passwordHash = await hashPassword(newPassword);
  const user = await User.findOneAndUpdate(
    {
      passwordResetTokenHash: hashResetToken(resetToken),
      passwordResetTokenExpiresAt: { $gt: new Date() },
    },
    {
      $set: { passwordHash },
      $unset: {
        passwordResetCodeHash: 1,
        passwordResetCodeExpiresAt: 1,
        passwordResetCodeAttempts: 1,
        passwordResetRequestedAt: 1,
        passwordResetTokenHash: 1,
        passwordResetTokenExpiresAt: 1,
      },
    },
    { new: true },
  ).select('_id');

  if (!user) throw invalidResetTokenError();
  await sessionService.revokeUserSessions(user._id);
  return { message: 'Password has been updated.' };
}

module.exports = {
  hashPassword,
  register,
  login,
  logout,
  verifyPassword,
  requestPasswordReset,
  verifyPasswordResetOtp,
  requestEmailSignInCode,
  verifyEmailSignInCode,
  resetPassword,
};
