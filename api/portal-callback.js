const {
  verifyPortalToken,
  createSessionCookie,
  serializeCookie,
  sanitizeRedirect,
  buildPortalLoginUrl,
  getRequestOrigin,
} = require('./utils/portalAuth')

const APP_ID = 'rams'

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end('Method Not Allowed')
    return
  }

  const origin = getRequestOrigin(req)
  const portalToken = req.query.portalToken
  const redirectParam = Array.isArray(req.query.redirect) ? req.query.redirect[0] : req.query.redirect
  const redirectTarget = sanitizeRedirect(redirectParam, origin)
  const absoluteRedirect = new URL(redirectTarget, origin).toString()

  if (!portalToken) {
    console.warn('[rams-dev-api] portal callback missing portalToken, redirecting to login')
    res.statusCode = 302
    res.setHeader('Location', buildPortalLoginUrl(absoluteRedirect))
    res.end()
    return
  }

  const payload = verifyPortalToken(portalToken)
  if (!payload || payload.appId !== APP_ID) {
    console.warn('[rams-dev-api] portal token invalid or for different app', { payload })
    res.statusCode = 302
    res.setHeader('Location', buildPortalLoginUrl(absoluteRedirect))
    res.end()
    return
  }

  const sessionCookie = createSessionCookie({
    uid: payload.uid,
    email: payload.email ?? null,
    displayName: payload.displayName ?? null,
  })
  res.setHeader('Set-Cookie', serializeCookie(sessionCookie))

  const destination = absoluteRedirect
  console.info('[rams-dev-api] established portal session, redirecting back to app', {
    uid: payload.uid,
    redirect: destination,
  })
  res.statusCode = 302
  res.setHeader('Location', destination)
  res.end()
}
