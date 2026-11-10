// server.js
// Server full-stack mandiri untuk DocuResearch (Port 3001)

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;

// Handler API
const healthHandler = require('./api/health');
const generateHandler = require('./api/generate');
const projectsHandler = require('./api/projects');
const referencesHandler = require('./api/references');

function enhanceResponse(res) {
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };

  res.json = function(data) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(data));
    return res;
  };
  return res;
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        req.body = {};
        return resolve();
      }
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = body;
      }
      resolve();
    });
  });
}

const server = http.createServer(async (req, res) => {
  enhanceResponse(res);
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  req.query = parsedUrl.query || {};

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Gemini-Key, X-Access-Pin');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Routing API
  if (pathname.startsWith('/api/')) {
    await parseRequestBody(req);

    try {
      if (pathname === '/api/health') {
        return await healthHandler(req, res);
      } else if (pathname === '/api/generate') {
        return await generateHandler(req, res);
      } else if (pathname === '/api/projects') {
        return await projectsHandler(req, res);
      } else if (pathname === '/api/references') {
        return await referencesHandler(req, res);
      } else {
        return res.status(404).json({
          ok: false,
          error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' }
        });
      }
    } catch (err) {
      console.error('[API Server Error]:', err);
      return res.status(500).json({
        ok: false,
        error: { code: 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  // Static File Serving (index.html)
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.status(500).end('Terjadi kesalahan memuat file.');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` 📘 DocuResearch Academic AI Studio Berjalan!`);
  console.log(` 🌐 Akses di browser: http://localhost:${PORT}`);
  console.log(` 📡 Health API:       http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
