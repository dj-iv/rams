const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Mount the existing Vercel-style handler
const generatePdfHandler = require(path.join(__dirname, 'api', 'generate-pdf.js'));

app.post('/api/generate-pdf', (req, res) => {
  // The handler expects (req, res) and returns/ends the response
  return generatePdfHandler(req, res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Local API server listening on http://localhost:${port}`));
