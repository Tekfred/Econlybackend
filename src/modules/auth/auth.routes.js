const { Router } = require('express');
const authController = require('./auth.controller');
const { validateLogin, validateRegistration } = require('./auth.validation');
const { authenticate } = require('../../middleware/authenticate');

const router = Router();
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
