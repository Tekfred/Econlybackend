const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required to start the API.');
  }

  await mongoose.connect(env.mongoUri);
  console.info('Connected to MongoDB.');
}

module.exports = { connectDatabase };
