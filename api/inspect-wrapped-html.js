const fs = require('fs');
const path = require('path');

// Debug endpoint: POST { html } -> returns the wrapped HTML string that the PDF service receives.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { html } = req.body || {};
    if (!html) return res.status(400).send('Missing html in request body');

    const deployHostname = process.env.VERCEL_URL || process.env.DEPLOYMENT_URL || process.env.DEPLOY_URL || 'rams-six.vercel.app';
    const origin = deployHostname.startsWith('http') ? deployHostname : `https://${deployHostname}`;

    let inlineCss = '';
    try {
      const cssDir = path.join(process.cwd(), 'build', 'static', 'css');
      if (fs.existsSync(cssDir)) {
        const files = fs.readdirSync(cssDir);
        const mainCss = files.find(f => f.startsWith('main') && f.endsWith('.css')) || files.find(f => f.endsWith('.css'));
        if (mainCss) inlineCss = fs.readFileSync(path.join(cssDir, mainCss), 'utf8');
      }
    } catch (e) {
      console.warn('inspect-wrapped-html: could not inline CSS', e && e.message ? e.message : e);
    }

    const wrapped = `<!doctype html><html><head><meta charset="utf-8"><base href="${origin}/"><meta name="viewport" content="width=device-width,initial-scale=1">${inlineCss ? `<style>${inlineCss}</style>` : ''}</head><body>${html}</body></html>`;

    // Return the wrapped HTML as text/html so you can open it in a browser to visually inspect it.
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(wrapped);
  } catch (err) {
    console.error('inspect-wrapped-html error', err && err.stack ? err.stack : err);
    return res.status(500).send('inspect-wrapped-html failed');
  }
};
