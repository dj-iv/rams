Local dev and Vercel deployment notes

1) Install dependencies (use legacy-peer-deps to resolve peer conflicts):

```powershell
cd C:\Users\roman\Documents\Projects\rams-generator
npm install --legacy-peer-deps
```

2) Optional: install full puppeteer for local rendering fallback (dev only):

```powershell
npm install --save-dev puppeteer@^10.1.0
```

3) Run Vercel locally (serves both the React app and serverless functions):

```powershell
npx vercel dev
```

4) Deploy to Vercel:

```powershell
npx vercel --prod
```

Notes:
- `api/generate-pdf.js` uses `chrome-aws-lambda` + `puppeteer-core` in production on Vercel. For local testing, the function tries to fall back to the dev-only `puppeteer` binary when available.
- If you prefer not to use `--legacy-peer-deps` globally, pin matching versions in `package.json` (already set to `puppeteer-core@^10.1.0` and `chrome-aws-lambda@^10.1.0`).
- Consider adding authentication to the function to prevent abuse.
