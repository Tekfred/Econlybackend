const mongoose = require('mongoose');
const env = require('../config/env');
const Product = require('../modules/products/product.model');
const User = require('../modules/auth/user.model');
const { hashPassword } = require('../modules/auth/auth.service');

const TEST_EMAIL = 'postman@example.test';
const TEST_PASSWORD = 'EcomlyLocal123!';
const PRODUCT_ID = new mongoose.Types.ObjectId('64f000000000000000000001');
const USER_ID = new mongoose.Types.ObjectId('64f000000000000000000002');

async function seedDevelopmentData() {
  if (env.nodeEnv !== 'development') {
    throw new Error('Refusing to seed unless NODE_ENV=development.');
  }

  const mongoUrl = new URL(env.mongoUri);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(mongoUrl.hostname)) {
    throw new Error('Refusing to seed a non-local MongoDB database.');
  }

  await mongoose.connect(env.mongoUri);

  await Product.updateOne(
    { _id: PRODUCT_ID },
    {
      $set: {
        title: 'Postman Sample T-Shirt',
        description: 'Local sample product for API development.',
        price: 120,
        currency: 'GHS',
        images: [],
        rating: 4.5,
        reviewCount: 2,
        isActive: true,
      },
    },
    { upsert: true },
  );

  await User.updateOne(
    { _id: USER_ID },
    {
      $set: {
        fullName: 'Postman Local Tester',
        email: TEST_EMAIL,
        passwordHash: await hashPassword(TEST_PASSWORD),
      },
    },
    { upsert: true },
  );

  console.info('Seeded local Postman fixtures.');
  console.info(`Email: ${TEST_EMAIL}`);
  console.info(`Password: ${TEST_PASSWORD}`);
  console.info(`Product id: ${PRODUCT_ID}`);
}

seedDevelopmentData()
  .catch((error) => {
    console.error('Development seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
