const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const productRoutes = require('./modules/products/product.routes');
const { cacheControl } = require('./middleware/cacheControl');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', cacheControl(60), productRoutes);
app.use('/api/v1/cart', cartRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'The requested route was not found.' },
  });
});
app.use(errorHandler);

module.exports = app;
