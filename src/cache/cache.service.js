const { redisClient } = require('../config/redis');

async function get(key) {
  if (!redisClient?.isReady) return null;

  try {
    return await redisClient.get(key);
  } catch (error) {
    console.warn(`Cache read failed for ${key}:`, error.message);
    return null;
  }
}

async function set(key, value, ttlSeconds) {
  if (!redisClient?.isReady) return;

  try {
    await redisClient.set(key, value, { EX: ttlSeconds });
  } catch (error) {
    // Cache failure should not prevent the database response from being used.
    console.warn(`Cache write failed for ${key}:`, error.message);
  }
}

async function del(key) {
  if (!redisClient?.isReady) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn(`Cache delete failed for ${key}:`, error.message);
  }
}

module.exports = { del, get, set };
