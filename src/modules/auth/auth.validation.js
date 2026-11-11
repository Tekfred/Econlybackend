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
  const { firstName, lastName, phoneNumber, dateOfBirth, email, password } = req.body || {};

  if (typeof firstName !== 'string' || !firstName.trim()) {
    return res.status(400).json({
      error: { code: 'FIRST_NAME_REQUIRED', message: 'First name is required.' },
    });
  }
  if (firstName.trim().length > 60) {
    return res.status(400).json({
      error: { code: 'FIRST_NAME_TOO_LONG', message: 'First name must be 60 characters or fewer.' },
    });
  }
  if (typeof lastName !== 'string' || !lastName.trim()) {
    return res.status(400).json({
      error: { code: 'LAST_NAME_REQUIRED', message: 'Last name is required.' },
    });
  }
  if (lastName.trim().length > 60) {
    return res.status(400).json({
      error: { code: 'LAST_NAME_TOO_LONG', message: 'Last name must be 60 characters or fewer.' },
    });
  }
  if (typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
    return res.status(400).json({
      error: { code: 'PHONE_NUMBER_REQUIRED', message: 'Phone number is required.' },
    });
  }
  const normalizedPhone = phoneNumber.trim().replace(/[\s().-]/g, '');
  if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
    return res.status(400).json({
      error: { code: 'INVALID_PHONE_NUMBER', message: 'Enter a valid phone number with 7 to 15 digits.' },
    });
  }
  if (typeof dateOfBirth !== 'string' || !dateOfBirth.trim()) {
    return res.status(400).json({
      error: { code: 'DATE_OF_BIRTH_REQUIRED', message: 'Date of birth is required in YYYY-MM-DD format.' },
    });
  }
  const normalizedDateOfBirth = dateOfBirth.trim();
  const parsedDateOfBirth = new Date(`${normalizedDateOfBirth}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDateOfBirth)
      || Number.isNaN(parsedDateOfBirth.getTime())
      || parsedDateOfBirth.toISOString().slice(0, 10) !== normalizedDateOfBirth) {
    return res.status(400).json({
      error: { code: 'INVALID_DATE_OF_BIRTH', message: 'Enter a valid date of birth in YYYY-MM-DD format.' },
    });
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (parsedDateOfBirth > today) {
    return res.status(400).json({
      error: { code: 'DATE_OF_BIRTH_IN_FUTURE', message: 'Date of birth cannot be in the future.' },
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

  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  req.body.phoneNumber = normalizedPhone;
  req.body.dateOfBirth = normalizedDateOfBirth;
  req.body.email = email.trim().toLowerCase();
  return next();
}

function validateRecoveryEmail(req, res) {
  const { email } = req.body || {};
  if (typeof email !== 'string' || !email.trim()) {
    res.status(400).json({
      error: { code: 'EMAIL_REQUIRED', message: 'Email is required.' },
    });
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({
      error: { code: 'INVALID_EMAIL', message: 'Enter a valid email address.' },
    });
    return false;
  }
  req.body.email = email.trim().toLowerCase();
  return true;
}

function validatePasswordResetRequest(req, res, next) {
  if (!validateRecoveryEmail(req, res)) return;
  return next();
}

function validateEmailSignInRequest(req, res, next) {
  if (!validateRecoveryEmail(req, res)) return;
  return next();
}

function validateEmailSignInOtp(req, res, next) {
  if (!validateRecoveryEmail(req, res)) return;
  const { code } = req.body || {};
  if (typeof code !== 'string' || !/^\d{4}$/.test(code)) {
    return res.status(400).json({
      error: { code: 'INVALID_SIGN_IN_CODE', message: 'Enter the four-digit sign-in code.' },
    });
  }
  return next();
}

function validatePasswordResetOtp(req, res, next) {
  if (!validateRecoveryEmail(req, res)) return;
  const { code } = req.body || {};
  if (typeof code !== 'string' || !/^\d{4}$/.test(code)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_RESET_CODE',
        message: 'Enter the four-digit reset code.',
      },
    });
  }
  return next();
}

function validatePasswordReset(req, res, next) {
  const { resetToken, newPassword } = req.body || {};
  if (typeof resetToken !== 'string' || resetToken.length < 32) {
    return res.status(400).json({
      error: { code: 'RESET_TOKEN_REQUIRED', message: 'A valid reset token is required.' },
    });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({
      error: {
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password must be at least 8 characters.',
      },
    });
  }
  if (Buffer.byteLength(newPassword, 'utf8') > 72) {
    return res.status(400).json({
      error: {
        code: 'PASSWORD_TOO_LONG',
        message: 'Password must be 72 bytes or fewer.',
      },
    });
  }
  return next();
}

module.exports = {
  validateLogin,
  validateRegistration,
  validatePasswordResetRequest,
  validateEmailSignInRequest,
  validateEmailSignInOtp,
  validatePasswordResetOtp,
  validatePasswordReset,
};
