const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const fs = require('fs')
const path = require('path')

function normalisePrivateKey(value) {
  return value.replace(/\\n/g, '\n')
}

function parseServiceAccountFile(candidate) {
  if (!candidate) {
    return null
  }

  try {
    const resolved = path.resolve(candidate)
    const raw = fs.readFileSync(resolved, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      return null
    }
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    }
  } catch (error) {
    console.warn('[rams] Failed to read service account file', { candidate, error: error?.message })
    return null
  }
}

function resolveServiceAccount(prefix, fallbackPaths = []) {
  const projectId = process.env[`${prefix}_FIREBASE_PROJECT_ID`] || process.env.FIREBASE_ADMIN_PROJECT_ID || null
  const clientEmail = process.env[`${prefix}_FIREBASE_CLIENT_EMAIL`] || process.env.FIREBASE_ADMIN_CLIENT_EMAIL || null
  const privateKey = process.env[`${prefix}_FIREBASE_PRIVATE_KEY`] || process.env.FIREBASE_ADMIN_PRIVATE_KEY || null

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: normalisePrivateKey(privateKey),
    }
  }

  const pathCandidates = [
    process.env[`${prefix}_FIREBASE_SERVICE_ACCOUNT`],
    process.env[`${prefix}_FIREBASE_CREDENTIALS_PATH`],
    process.env[`${prefix}_GOOGLE_APPLICATION_CREDENTIALS`],
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    ...fallbackPaths,
  ].filter(Boolean)

  for (const candidate of pathCandidates) {
    const parsed = parseServiceAccountFile(candidate)
    if (parsed) {
      return {
        projectId: parsed.projectId,
        clientEmail: parsed.clientEmail,
        privateKey: normalisePrivateKey(parsed.privateKey),
      }
    }
  }

  return null
}

function initAdminApp(appName, prefix, fallbackPaths = []) {
  const existing = getApps().find((app) => app.name === appName)
  if (existing) {
    return existing
  }

  const credentials = resolveServiceAccount(prefix, fallbackPaths)
  if (!credentials) {
    throw new Error(`[rams] Firebase admin credentials are not configured for ${appName}`)
  }

  return initializeApp(
    {
      credential: cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
    },
    appName,
  )
}

function getRamsAuth() {
  const fallback = path.join(process.cwd(), 'firebase-service-account.json')
  const app = initAdminApp('rams-admin', 'RAMS', [fallback])
  return getAuth(app)
}

module.exports = {
  getRamsAuth,
}
