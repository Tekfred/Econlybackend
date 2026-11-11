const { Router } = require('express');
const authController = require('./auth.controller');
const {
  validateLogin,
  validateRegistration,
  validatePasswordResetRequest,
  validatePasswordResetOtp,
  validatePasswordReset,
  validateEmailSignInRequest,
  validateEmailSignInOtp,
} = require('./auth.validation');
const { authenticate } = require('../../middleware/authenticate');

const router = Router();
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/email-code/request', validateEmailSignInRequest, authController.requestEmailSignInCode);
router.post('/email-code/verify', validateEmailSignInOtp, authController.verifyEmailSignInCode);
router.post(
  '/password-reset/request',
  validatePasswordResetRequest,
  authController.requestPasswordReset,
);
router.post(
  '/password-reset/verify',
  validatePasswordResetOtp,
  authController.verifyPasswordResetOtp,
);
router.post(
  '/password-reset/confirm',
  validatePasswordReset,
  authController.resetPassword,
);

module.exports = router;
