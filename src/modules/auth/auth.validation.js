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

function validateRegistration(req, res, next) {
  const { fullName, email, password } = req.body || {};

  if (typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({
      error: { code: 'FULL_NAME_REQUIRED', message: 'Full name is required.' },
    });
  }
  if (fullName.trim().length > 120) {
    return res.status(400).json({
      error: { code: 'FULL_NAME_TOO_LONG', message: 'Full name must be 120 characters or fewer.' },
    });
  }
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
  if (password.length < 8) {
    return res.status(400).json({
      error: { code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 8 characters.' },
    });
  }

  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  return next();
}

module.exports = { validateLogin, validateRegistration };
