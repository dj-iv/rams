const { createProxyMiddleware } = require('http-proxy-middleware');

const DEFAULT_TARGET = 'http://localhost:3101';

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_RAMS_API_ORIGIN || process.env.RAMS_API_ORIGIN || DEFAULT_TARGET;

  const sharedProxyOptions = {
    target,
    changeOrigin: true,
    xfwd: true,
    logLevel: 'warn',
    onError(err, req, res) {
      console.error('[rams-dev-proxy] API proxy error', err);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(
        JSON.stringify({
          error: `Unable to reach RAMS API. Is the dev API server running on ${target}?`,
        }),
      );
    },
  };

  app.use('/api', createProxyMiddleware(sharedProxyOptions));
  app.use('/session', createProxyMiddleware(sharedProxyOptions));
  app.use('/logout', createProxyMiddleware(sharedProxyOptions));
  app.use(
    '/portal/callback',
    createProxyMiddleware({
      ...sharedProxyOptions,
      pathRewrite: (path = '') => {
        const queryIndex = path.indexOf('?');
        const query = queryIndex >= 0 ? path.slice(queryIndex) : '';
        return `/portal/callback${query}`;
      },
    }),
  );
};
