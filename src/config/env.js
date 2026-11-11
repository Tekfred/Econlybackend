const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  redisUrl: process.env.REDIS_URL || '',
  redisEnabled: process.env.REDIS_ENABLED === 'true',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number.parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || '',
  passwordResetOtpTtlMinutes: Number.parseInt(
    process.env.PASSWORD_RESET_OTP_TTL_MINUTES || '10',
    10,
  ),
  passwordResetTokenTtlMinutes: Number.parseInt(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || '10',
    10,
  ),
});

module.exports = env;
