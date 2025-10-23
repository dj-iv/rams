const {
  getSessionCookieName,
  serializeCookie,
  buildPortalLogoutUrl,
  sanitizeRedirect,
  getRequestOrigin,
  getPortalBaseUrl,
} = require('./utils/portalAuth')

module.exports = (req, res) => {
  if (!['POST', 'GET'].includes(req.method || 'GET')) {
    res.statusCode = 405
    res.setHeader('Allow', 'GET,POST')
    res.end('Method Not Allowed')
    return
  }

  const origin = getRequestOrigin(req)
  const body = req.method === 'POST' && req.body && typeof req.body === 'object' ? req.body : {}
  const redirectParam = body.redirect || (Array.isArray(req.query?.redirect) ? req.query.redirect[0] : req.query?.redirect)
  const redirectPath = sanitizeRedirect(typeof redirectParam === 'string' ? redirectParam : '/', origin)
  const absoluteRedirect = new URL(redirectPath, origin).toString()

  const sessionCookieName = getSessionCookieName()
  const portalUrl = getPortalBaseUrl()
  const secure = portalUrl ? portalUrl.startsWith('https://') : process.env.NODE_ENV === 'production'

  const clearCookieHeader = serializeCookie({
    name: sessionCookieName,
    value: '',
    attributes: {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'Lax',
      maxAge: 0,
    },
  })

  res.setHeader('Set-Cookie', clearCookieHeader)

  const logoutUrl = buildPortalLogoutUrl(absoluteRedirect)

  if ((req.method || 'GET') === 'GET') {
    res.statusCode = 302
    res.setHeader('Location', logoutUrl)
    res.end()
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ redirect: logoutUrl }))
}
