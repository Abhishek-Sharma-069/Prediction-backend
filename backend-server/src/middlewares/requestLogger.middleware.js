/**
 * Console logging middleware for debugging.
 * Logs every API request (method, path, body summary) and response (status, duration).
 * Mount after express.json() and cookieParser() so it runs for all /api routes.
 */
const MAX_BODY_LOG = 300;

function summarize(body) {
  if (body === undefined || body === null) return '';
  try {
    const s = typeof body === 'string' ? body : JSON.stringify(body);
    return s.length <= MAX_BODY_LOG ? s : s.slice(0, MAX_BODY_LOG) + '...';
  } catch {
    return '[non-serializable]';
  }
}

export function requestLogger(req, res, next) {
  const start = Date.now();
  const method = req.method;
  const path = req.originalUrl || req.url;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const bodySummary = req.body && method !== 'GET' ? summarize(req.body) : '';
    const line = `[${new Date().toISOString()}] ${method} ${path} ${status} ${duration}ms`;
    console.log(line);
    if (bodySummary) console.log('  body:', bodySummary);
  });

  next();
}
