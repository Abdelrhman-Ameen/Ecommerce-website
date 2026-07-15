const crypto = require('crypto');

function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

function sanitizeObject(value) {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
      .map(([key, item]) => [key, sanitizeObject(item)]),
  );
}

function sanitizeInput(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  next();
}

function enforceTrustedOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  const forwardedHost = req.get('x-forwarded-host') || req.get('host');
  const configured = (process.env.CLIENT_URL || '').split(',').map((item) => item.trim()).filter(Boolean);
  try {
    const originUrl = new URL(origin);
    if (originUrl.host === forwardedHost || configured.includes(origin)) return next();
    if (process.env.NODE_ENV !== 'production') {
      const requestHostname = forwardedHost.split(':')[0];
      const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);
      if (loopbackHosts.has(originUrl.hostname) && loopbackHosts.has(requestHostname)) return next();
    }
  } catch {
    // The shared error handler returns the response below for malformed origins.
  }
  return res.status(403).json({ status: 'fail', message: 'Request origin is not allowed', requestId: req.id });
}

module.exports = { requestContext, sanitizeInput, enforceTrustedOrigin };
