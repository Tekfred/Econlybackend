const { createClient } = require('redis');
const env = require('./env');

const redisClient = env.redisEnabled && env.redisUrl
  ? createClient({
      url: env.redisUrl,
      socket: {
        reconnectStrategy(retries) {
          if (retries > 3) return new Error('Redis connection failed.');
          return Math.min(retries * 200, 1000);
        },
      },
    })
  : null;

if (redisClient) {
  redisClient.on('error', (error) => {
    console.warn('Redis connection error:', error.message);
  });
}

async function connectRedis() {
  if (!redisClient) {
    console.info('Redis cache is disabled.');
    return null;
  }

  await redisClient.connect();
  console.info('Connected to Redis.');
  return redisClient;
}

module.exports = { connectRedis, redisClient };
