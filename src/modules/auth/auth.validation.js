function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      error: { code: 'EMAIL_REQUIRED', message: 'Email is required.' },
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      error: { code: 'INVALID_EMAIL', message: 'Enter a valid email address.' },
    });
  }
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({
      error: { code: 'PASSWORD_REQUIRED', message: 'Password is required.' },
    });
  }

  req.body.email = email.trim().toLowerCase();
  return next();
}

module.exports = { validateLogin };
