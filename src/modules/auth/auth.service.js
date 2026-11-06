const bcrypt = require('bcrypt');
const User = require('./user.model');
const sessionService = require('../sessions/session.service');

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

module.exports = { hashPassword, register, login, logout, verifyPassword };
