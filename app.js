require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const connectDatabase = require('./config/db-connect');
const authRouter = require('./routes/auth-routes');
const productRouter = require('./routes/product-routes');
const cartRouter = require('./routes/cart-routes');
const orderRouter = require('./routes/order-routes');
const adminRouter = require('./routes/admin-routes');
const siteRouter = require('./routes/site-routes');
const { requestContext, sanitizeInput, enforceTrustedOrigin } = require('./middleware/security-middleware');
const { notFound, errorHandler } = require('./middleware/error-middleware');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(requestContext);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors((req, callback) => {
  const origin = req.get('origin');
  const host = req.get('x-forwarded-host') || req.get('host');
  const configured = (process.env.CLIENT_URL || '').split(',').map((item) => item.trim()).filter(Boolean);
  let allowed = !origin || configured.includes(origin);
  try {
    if (origin && new URL(origin).host === host) allowed = true;
  } catch {
    allowed = false;
  }
  callback(null, { origin: allowed, credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] });
}));
app.use(express.json({ limit: '250kb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use(enforceTrustedOrigin);
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Vellora API is healthy', timestamp: new Date().toISOString() });
});

app.use('/api/v1', async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many sign-in attempts. Please try again later.' },
});

app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/site', siteRouter);
app.use('/api/v1/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
