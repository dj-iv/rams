const chromium = require('chrome-aws-lambda');
let puppeteer = require('puppeteer-core');
// We'll decide whether to require full puppeteer after checking chrome-aws-lambda's executablePath

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { html } = req.body;
    if (!html) return res.status(400).send('Missing html');

  // Determine executable path and launch options
  let launchOptions = { args: chromium.args, defaultViewport: chromium.defaultViewport, headless: true };
  // Determine executable path with a clear preference order:
  // 1. CHROME_PATH env
  // 2. local installed full puppeteer executablePath()
  // 3. chrome-aws-lambda.executablePath (may be function or value)
  let chromExec = null;
  try {
    if (process.env.CHROME_PATH) {
      chromExec = process.env.CHROME_PATH;
      console.log('Using CHROME_PATH env:', chromExec);
    } else {
      // Try to use full puppeteer (if installed) to get its executable
      try {
        // eslint-disable-next-line global-require
        const pp = require('puppeteer');
        if (pp) {
          try {
            const pExec = (typeof pp.executablePath === 'function') ? pp.executablePath() : pp.executablePath;
            if (pExec) {
              chromExec = pExec;
              console.log('Using puppeteer.executablePath():', chromExec);
            }
          } catch (e) {
            console.warn('puppeteer.executablePath() failed:', e && e.message ? e.message : e);
          }
        }
      } catch (e) {
        // full puppeteer not available
      }

      // If still not found, try chrome-aws-lambda's executablePath (function or value)
      if (!chromExec) {
        try {
          if (typeof chromium.executablePath === 'function') {
            const val = await chromium.executablePath();
            if (val) chromExec = val;
          } else if (chromium.executablePath) {
            chromExec = chromium.executablePath;
          }
          if (chromExec) console.log('Using chrome-aws-lambda executablePath:', chromExec);
        } catch (e) {
          console.warn('chrome-aws-lambda executablePath call failed:', e && e.message ? e.message : e);
        }
      }
    }
  } catch (e) {
    console.warn('Executable detection failed:', e && e.message ? e.message : e);
  }
  const execPath = chromExec || null;
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
      launchOptions.args = chromium.args || launchOptions.args;
      launchOptions.defaultViewport = chromium.defaultViewport || launchOptions.defaultViewport;
      launchOptions.headless = chromium.headless === undefined ? true : chromium.headless;
    } else {
      // No aws-lambda chromium; try to require full puppeteer to use its local Chromium binary
      console.log('No chrome-aws-lambda executablePath found; attempting to require full puppeteer for local Chromium');
      try {
        // eslint-disable-next-line global-require
        const full = require('puppeteer');
        puppeteer = full;
        // If puppeteer.executablePath is a function, call it to get the local binary path
        if (typeof puppeteer.executablePath === 'function') {
          try {
            const ppExec = puppeteer.executablePath();
            if (ppExec) {
              launchOptions.executablePath = ppExec;
              console.log('Using puppeteer executablePath:', ppExec);
            }
          } catch (e) {
            console.warn('puppeteer.executablePath() threw:', e && e.message ? e.message : e);
          }
        }
      } catch (e) {
        console.warn('Full puppeteer not available locally; still relying on puppeteer-core', e && e.message ? e.message : e);
      }
    }

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
        return res.status(500).send(`Browser launch failed: ${detailMsg}`);
    }
  } catch (err) {
    console.error('PDF generation failed', err && err.stack ? err.stack : err);
    const message = (err && err.message) ? `PDF generation failed: ${err.message}` : 'PDF generation failed';
    res.status(500).send(message);
  }
};
