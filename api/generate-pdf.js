const chromium = require('chrome-aws-lambda');
let puppeteer = require('puppeteer-core');

// In local dev (vercel dev) chrome-aws-lambda may not provide a binary.
// Try to fall back to full puppeteer if available.
try {
  if (!chromium.executablePath || chromium.executablePath === '') {
    // try to load full puppeteer
    // eslint-disable-next-line global-require
    puppeteer = require('puppeteer');
    console.log('Falling back to full puppeteer for local rendering');
  }
} catch (e) {
  // ignore; we'll attempt to use puppeteer-core with chromium.executablePath
  console.warn('Full puppeteer not available, will attempt chrome-aws-lambda binary', e.message || e);
}

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
    const execPath = (await chromium.executablePath) || process.env.CHROME_PATH || null;
    if (execPath) {
      launchOptions.executablePath = execPath;
      launchOptions.args = chromium.args || launchOptions.args;
      launchOptions.defaultViewport = chromium.defaultViewport || launchOptions.defaultViewport;
      launchOptions.headless = chromium.headless === undefined ? true : chromium.headless;
    } else {
      // No aws-lambda chromium; if puppeteer (full) is available it will use the bundled Chromium
      console.log('No chrome-aws-lambda executablePath found; relying on puppeteer to provide Chromium');
    }

    console.log('Launching browser with options', { hasExecPath: !!launchOptions.executablePath });
    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }, preferCSSPageSize: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="rams-document.pdf"');
    res.status(200).send(pdf);
  } catch (err) {
    console.error('PDF generation failed', err && err.stack ? err.stack : err);
    const message = (err && err.message) ? `PDF generation failed: ${err.message}` : 'PDF generation failed';
    res.status(500).send(message);
  }
};
