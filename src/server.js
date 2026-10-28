const app = require('./app');
const { connectDatabase } = require('./config/database');
const { connectRedis, redisClient } = require('./config/redis');
const env = require('./config/env');

async function startServer() {
  await connectDatabase();
  try {
    await connectRedis();
  } catch (error) {
    // Redis is an optional cache. The API can still read from MongoDB.
    console.warn('Redis is unavailable; continuing without cache:', error.message);
  }

  const server = app.listen(env.port, () => {
    console.info(`Ecomly API listening on port ${env.port}.`);
  });

  const shutdown = async () => {
    server.close();
    if (redisClient?.isOpen) await redisClient.quit();
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('Failed to start Ecomly API:', error.message);
  process.exit(1);
});
