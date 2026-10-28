const authService = require('./auth.service');

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

module.exports = { login, logout };
