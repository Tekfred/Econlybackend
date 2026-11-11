const { createHash, randomBytes } = require('node:crypto');
const Session = require('./session.model');

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function createSession(userId) {
  const accessToken = randomBytes(32).toString('base64url');
  const refreshToken = randomBytes(48).toString('base64url');

  await Session.create({
    userId,
    accessTokenHash: hashToken(accessToken),
    refreshTokenHash: hashToken(refreshToken),
    accessExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

async function findByAccessToken(token) {
  const session = await Session.findOne({
    accessTokenHash: hashToken(token),
    accessExpiresAt: { $gt: new Date() },
    refreshExpiresAt: { $gt: new Date() },
  }).select('+accessTokenHash +refreshTokenHash');

  return session;
}

async function revokeSession(sessionId) {
  return Session.findByIdAndDelete(sessionId);
}

async function revokeUserSessions(userId) {
  return Session.deleteMany({ userId });
}

module.exports = {
  createSession,
  findByAccessToken,
  revokeSession,
  revokeUserSessions,
};
