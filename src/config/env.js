const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  redisUrl: process.env.REDIS_URL || '',
  redisEnabled: process.env.REDIS_ENABLED === 'true',
});

module.exports = env;
