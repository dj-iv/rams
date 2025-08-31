const chromium = require('chrome-aws-lambda');
let puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Helper to get an executablePath for puppeteer
async function resolveExecPath() {
  // Prefer explicit CHROME_PATH
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  // Prefer chrome-aws-lambda when available (serverless)
  try {
    if (typeof chromium.executablePath === 'function') return await chromium.executablePath();
    if (chromium.executablePath && typeof chromium.executablePath.then === 'function') return await chromium.executablePath;
    if (chromium.executablePath) return chromium.executablePath;
  } catch (e) {
    console.warn('chrome-aws-lambda execPath failed:', e && e.message ? e.message : e);
  }

  // If running locally, try full puppeteer package
  try {
    // eslint-disable-next-line global-require
    const full = require('puppeteer');
    if (full && typeof full.executablePath === 'function') return full.executablePath();
  } catch (e) {
    // ignore
  }

  return null;
}

// Build wrapper HTML similar to the pdflayer wrapper so styles resolve
function buildWrappedHtml(html) {
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
    console.warn('Could not inline CSS for puppeteer wrapper:', e && e.message ? e.message : e);
  }

  return `<!doctype html><html><head><meta charset="utf-8"><base href="${origin}/"><meta name="viewport" content="width=device-width,initial-scale=1">${inlineCss ? `<style>${inlineCss}</style>` : ''}</head><body>${html}</body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { url, html, waitForSelector } = req.body || {};
    if (!url && !html) return res.status(400).send('Provide either `url` or `html` in the request body');

    const execPath = await resolveExecPath();
    const launchArgs = (chromium && chromium.args && chromium.args.length) ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'];
    const launchOptions = { args: launchArgs, headless: true };
    if (execPath) launchOptions.executablePath = execPath;

    // Diagnostic
    console.log('Puppeteer generate PDF: execPath?', !!execPath, 'launchOptions args length', launchArgs.length);

    // If there's no execPath, return a clear error (avoid confusing puppeteer launch errors)
    if (!execPath) {
      const advice = 'No Chromium execPath available on server. Set CHROME_PATH, include chrome-aws-lambda binary, or run locally with full puppeteer.';
      console.error(advice);
      return res.status(502).send(advice);
    }

    // Lazily require puppeteer.launch implementation (puppeteer-core)
    if (!puppeteer || !puppeteer.launch) puppeteer = require('puppeteer-core');

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Set a viewport that maps reasonably to A4; Puppeteer will override for pdf but viewport helps layout
    await page.setViewport({ width: 1200, height: 1600 });

    if (url) {
      // Navigate to the provided URL (full URL expected)
      console.log('Navigating to url for PDF:', url);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    } else {
      const wrapped = buildWrappedHtml(html);
      await page.setContent(wrapped, { waitUntil: 'networkidle0' });
    }

    if (waitForSelector) {
      try {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      } catch (e) {
        console.warn('waitForSelector timed out:', waitForSelector);
      }
    }

    // Give a short pause to ensure fonts/images finalize
    await page.waitForTimeout(500);

    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }, preferCSSPageSize: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rams-document.pdf"');
    return res.status(200).send(pdf);
  } catch (err) {
    console.error('Puppeteer PDF generation failed', err && err.stack ? err.stack : err);
    return res.status(500).send('Puppeteer PDF generation failed: ' + (err && err.message ? err.message : String(err)));
  }
};
