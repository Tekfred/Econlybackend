const nodemailer = require('nodemailer');
const env = require('../../config/env');

let transporter;

function isConfigured() {
  return Boolean(env.smtpHost && env.emailFrom);
}

function getTransporter() {
  if (!isConfigured()) return null;
  if (!transporter) {
    const auth = env.smtpUser && env.smtpPass
      ? { user: env.smtpUser, pass: env.smtpPass }
      : undefined;
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth,
    });
  }
  return transporter;
}

async function sendPasswordResetCode({ email, code, expiresInMinutes }) {
  const mailer = getTransporter();
  if (!mailer) {
    if (env.nodeEnv === 'development') {
      console.info(`[development] Password reset code for ${email}: ${code}`);
      return;
    }
    throw new Error('SMTP is not configured for password recovery.');
  }

  await mailer.sendMail({
    from: env.emailFrom,
    to: email,
    subject: 'Your Econly password reset code',
    text: `Your Econly password reset code is ${code}. It expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your Econly password reset code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.</p>`,
  });
}

async function sendEmailSignInCode({ email, code, expiresInMinutes }) {
  const mailer = getTransporter();
  if (!mailer) {
    if (env.nodeEnv === 'development') {
      console.info(`[development] Email sign-in code for ${email}: ${code}`);
      return;
    }
    throw new Error('SMTP is not configured for email sign-in.');
  }

  await mailer.sendMail({
    from: env.emailFrom,
    to: email,
    subject: 'Your Econly sign-in code',
    text: `Your Econly sign-in code is ${code}. It expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your Econly sign-in code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in ${expiresInMinutes} minutes. If you did not request this, you can ignore this email.</p>`,
  });
}

module.exports = { isConfigured, sendPasswordResetCode, sendEmailSignInCode };
