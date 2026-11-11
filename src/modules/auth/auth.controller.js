const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.auth.sessionId);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

async function requestEmailSignInCode(req, res, next) {
  try {
    const result = await authService.requestEmailSignInCode(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function verifyEmailSignInCode(req, res, next) {
  try {
    const result = await authService.verifyEmailSignInCode(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function verifyPasswordResetOtp(req, res, next) {
  try {
    const result = await authService.verifyPasswordResetOtp(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  requestEmailSignInCode,
  verifyEmailSignInCode,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
};
