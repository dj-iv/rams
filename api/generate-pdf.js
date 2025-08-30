const chromium = require('chrome-aws-lambda');
let puppeteer = require('puppeteer-core');
// Use node-fetch for server-side HTTP calls (pdflayer)
const fetch = require('node-fetch');
// We'll decide whether to require full puppeteer after checking chrome-aws-lambda's executablePath

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { html } = req.body;
    if (!html) return res.status(400).send('Missing html');

    // If PDFLAYER_KEY is provided, try pdflayer (apilayer) first with retries
    if (process.env.PDFLAYER_KEY) {
      console.log('PDFLAYER_KEY detected; attempting pdflayer conversion');
      const pdflayerUrl = 'https://api.pdflayer.com/api/convert';
      const key = process.env.PDFLAYER_KEY;

      const FormData = require('form-data');
      const tryPdflayer = async () => {
        // prefer x-www-form-urlencoded
        const urlParams = new URLSearchParams();
        urlParams.append('access_key', key);
        urlParams.append('document_html', html);
        urlParams.append('page_size', 'A4');
        urlParams.append('orientation', 'portrait');
        urlParams.append('render_background', 'true');
        urlParams.append('render_delay', '250');

        const maxAttempts = 4;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            // Use form-encoded on the first attempt, then try multipart form-data on subsequent attempts
            let resp;
            if (attempt === 1) {
              resp = await fetch(pdflayerUrl, { method: 'POST', body: urlParams });
            } else {
              const form = new FormData();
              form.append('access_key', key);
              form.append('document_html', html);
              form.append('page_size', 'A4');
              form.append('orientation', 'portrait');
              form.append('render_background', 'true');
              form.append('render_delay', '250');
              resp = await fetch(pdflayerUrl, { method: 'POST', body: form, headers: form.getHeaders ? form.getHeaders() : {} });
            }

            const ctype = (resp.headers.get('content-type') || '').toLowerCase();
            // Read body as Buffer once to avoid double-read errors
            const buf = await resp.buffer();
            // If service returned HTML/XML/JSON, treat as non-PDF reply
            if (ctype.includes('application/json') || ctype.includes('text/xml') || ctype.includes('text/html')) {
              const txt = buf.toString('utf8');
              console.warn(`pdflayer returned non-PDF (status ${resp.status}) on attempt ${attempt}:`, txt.slice(0, 1024));
              // If 503, treat as immediate failure and break to fallback
              if (resp.status === 503) return { ok: false, status: resp.status, body: txt };
              if (resp.status >= 500 && attempt < maxAttempts) {
                const jitter = Math.floor(Math.random() * 300);
                await new Promise(r => setTimeout(r, 500 * attempt + jitter));
                continue;
              }
              return { ok: false, status: resp.status, body: txt };
            }

            if (!resp.ok) {
              const txt = buf.toString('utf8');
              console.warn(`pdflayer returned status ${resp.status} on attempt ${attempt}:`, txt.slice(0, 1024));
              if (resp.status >= 500 && attempt < maxAttempts) {
                const jitter = Math.floor(Math.random() * 300);
                await new Promise(r => setTimeout(r, 500 * attempt + jitter));
                continue;
              }
              return { ok: false, status: resp.status, body: txt };
            }

            // Successful PDF response
            return { ok: true, buffer: Buffer.from(buf) };
          } catch (e) {
            console.warn(`pdflayer attempt ${attempt} failed:`, e && e.message ? e.message : e);
            if (attempt < maxAttempts) {
              const jitter = Math.floor(Math.random() * 300);
              await new Promise(r => setTimeout(r, 500 * attempt + jitter));
              continue;
            }
            return { ok: false, status: 502, body: String(e) };
          }
        }
        return { ok: false, status: 502, body: 'pdflayer unknown error' };
      };

      try {
        const result = await tryPdflayer();
        if (result.ok) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename="rams-document.pdf"');
          return res.status(200).send(result.buffer);
        }

        // Log pdflayer failure details then continue to Puppeteer fallback
        console.warn('pdflayer failed:', result.status, result.body);
        // If pdflayer returned a JSON error body, forward it for easier debugging
        if (result.body && typeof result.body === 'string' && result.body.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(result.body);
            console.warn('pdflayer error JSON:', parsed);
          } catch (e) {
            // ignore parse error
          }
        }
        // fall through to Puppeteer path
      } catch (e) {
        console.error('pdflayer conversion unexpected error', e && e.stack ? e.stack : e);
      }
    }

  // Determine executable path and launch options
  let launchOptions = { args: [], defaultViewport: chromium.defaultViewport || null, headless: true };

  // Prefer the chrome-aws-lambda executable when running on serverless environments
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';
  let execPath = null;
  try {
    if (isServerless) {
      try {
        // chrome-aws-lambda.executablePath can be a function, a Promise, or a string depending on version.
        if (typeof chromium.executablePath === 'function') {
          execPath = await chromium.executablePath();
        } else if (chromium.executablePath && typeof chromium.executablePath.then === 'function') {
          // it's a Promise-like object
          execPath = await chromium.executablePath;
        } else {
          execPath = chromium.executablePath;
        }
        console.log('Detected serverless environment; using chrome-aws-lambda executablePath:', execPath);
      } catch (e) {
        console.warn('chrome-aws-lambda executablePath() failed in serverless env:', e && e.message ? e.message : e);
      }
    }

    // If CHROME_PATH is explicitly provided, prefer it (useful for custom deploys)
    if (!execPath && process.env.CHROME_PATH) {
      execPath = process.env.CHROME_PATH;
      console.log('Using CHROME_PATH env:', execPath);
    }

    // If still not found and we're running locally, try to use full puppeteer (dev)
    if (!execPath && !isServerless) {
      try {
        // eslint-disable-next-line global-require
        const full = require('puppeteer');
        if (full && typeof full.executablePath === 'function') {
          try {
            const pExec = full.executablePath();
            if (pExec) execPath = pExec;
            console.log('Using local puppeteer executablePath:', pExec);
          } catch (e) {
            console.warn('puppeteer.executablePath() failed:', e && e.message ? e.message : e);
          }
        }
      } catch (e) {
        // full puppeteer not installed locally — fine, we'll use puppeteer-core and hope chrome-aws-lambda provides an execPath
      }
    }
  } catch (e) {
    console.warn('Executable detection failed:', e && e.message ? e.message : e);
  }
    // Diagnostic info
    try {
      const fs = require('fs');
      const puppeteerPkg = puppeteer && puppeteer._preferredRevision ? { preferredRevision: puppeteer._preferredRevision } : {};
      console.log('PDF generator diagnostics:', {
        puppeteerType: puppeteer && puppeteer.launch ? 'full' : 'core',
        puppeteerVersion: (puppeteer && puppeteer.version) ? puppeteer.version() : undefined,
        puppeteerPreferredRevision: puppeteerPkg.preferredRevision,
        chromeAwsExecutable: execPath,
        chromeEnvPath: process.env.CHROME_PATH,
        puppeteerSkipDownload: process.env.PUPPETEER_SKIP_DOWNLOAD || null
      });
      if (execPath) {
        console.log('ExecPath exists on FS?', fs.existsSync(execPath));
      }
    } catch (diagErr) {
      console.warn('Diagnostics failed:', diagErr && diagErr.message ? diagErr.message : diagErr);
    }
    if (execPath) {
      launchOptions.executablePath = execPath;
    }

    // Always prefer chrome-aws-lambda args and headless flag when available
    launchOptions.args = chromium.args && chromium.args.length ? chromium.args : launchOptions.args;
    launchOptions.defaultViewport = chromium.defaultViewport || launchOptions.defaultViewport;
    launchOptions.headless = typeof chromium.headless === 'undefined' ? true : chromium.headless;

    try {
      const fs = require('fs');
      console.log('Launching browser with options', { hasExecPath: !!launchOptions.executablePath, launchExecPath: launchOptions.executablePath, launchType: typeof puppeteer.launch });
      if (launchOptions.executablePath) console.log('Launch execPath exists?', fs.existsSync(launchOptions.executablePath));
      const browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }, preferCSSPageSize: true });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="rams-document.pdf"');
      return res.status(200).send(pdf);
    } catch (launchErr) {
      console.error('Browser launch failed', launchErr && launchErr.stack ? launchErr.stack : launchErr);
        const detailMsg = (launchErr && launchErr.message) ? launchErr.message : String(launchErr);
        // If the failure is specifically that PrintToPDF is not implemented (common in some local Chrome builds),
        // return an HTML fallback that auto-triggers window.print() so the client can Save-as-PDF.
        if (detailMsg && detailMsg.includes('PrintToPDF')) {
          const fallbackHtml = `<!doctype html><html><head><meta charset="utf-8"><title>RAMS - Print fallback</title></head><body>${html}<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script></body></html>`;
          res.setHeader('Content-Type', 'text/html');
          return res.status(200).send(fallbackHtml);
        }

        // Provide execPath diagnostic when returning the error to help identify missing chrome binary on Vercel
        const execInfo = launchOptions && launchOptions.executablePath ? ` (execPath: ${launchOptions.executablePath})` : '';
        const advice = `TROUBLESHOOTING: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md`;
        return res.status(500).send(`Browser launch failed: ${detailMsg}${execInfo}\n\n${advice}`);
    }
  } catch (err) {
    console.error('PDF generation failed', err && err.stack ? err.stack : err);
    const message = (err && err.message) ? `PDF generation failed: ${err.message}` : 'PDF generation failed';
    res.status(500).send(message);
  }
};
