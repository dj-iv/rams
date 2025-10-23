const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');

const PORT = Number(process.env.RAMS_API_PORT || process.env.PORT || 3101);

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[rams-dev-api] ${req.method} ${req.url}`);
  next();
});

const loadHandler = (relativePath) => {
  const absolutePath = path.join(__dirname, relativePath);
  const resolved = require.resolve(absolutePath);
  delete require.cache[resolved];
  return require(resolved);
};

const adaptHandler = (handlerPath) => async (req, res, next) => {
  try {
    const handler = loadHandler(handlerPath);
    const result = handler(req, res);
    if (result && typeof result.then === 'function') {
      await result;
    }
  } catch (error) {
    next(error);
  }
};

app.all(['/api/session', '/session'], adaptHandler('./api/session'));
app.get(['/api/portal-callback', '/portal/callback'], adaptHandler('./api/portal-callback'));
app.all(['/api/logout', '/logout'], adaptHandler('./api/logout'));

app.use((error, req, res, next) => {
  console.error('[rams-dev-api] handler error', error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const server = app.listen(PORT, () => {
  console.log(`RAMS dev API listening on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    console.error(
  `[rams-dev-api] Port ${PORT} is already in use. Either stop the other process using it or set RAMS_API_PORT to a free port (example: $env:RAMS_API_PORT=3201).`,
    );
    process.exit(1);
  }

  throw error;
});
