const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const pool = require('./config/db');
const authRoutes = require('./routes/authroutes');
const port = process.env.PORT || 3000;

const FRONTEND_ROOT = path.join(__dirname, '../frontend');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const sendFile = (res, filePath, contentType) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    if (!body) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const serveStatic = (req, res, pathname) => {
  const normalizedPath = pathname.replace(/^\/+/,'');
  const safePath = path.normalize(path.join(FRONTEND_ROOT, normalizedPath));
  if (!safePath.startsWith(FRONTEND_ROOT + path.sep) && safePath !== FRONTEND_ROOT) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  const ext = path.extname(safePath) || '.html';
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  sendFile(res, safePath, contentType);
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/login' || pathname === '/api/register') {
    setCorsHeaders(res);
    const authHandled = authRoutes(req, res);
    if (authHandled !== null) {
      return;
    }
  }

  if (pathname === '/api/workplans') {
    setCorsHeaders(res);

    if (req.method === 'GET') {
      try {
        const result = await pool.query('SELECT * FROM workplans');
        sendJson(res, 200, result.rows);
      } catch (error) {
        console.error(error);
        sendJson(res, 500, { error: 'Failed to load workplans' });
      }
      return;
    }

    if (req.method === 'POST') {
      try {
        const body = await parseBody(req);
        const { objective, activity, timeline, status } = body;

        if (!objective || !activity || !timeline || !status) {
          sendJson(res, 400, { error: 'objective, activity, timeline, and status are required' });
          return;
        }

        const result = await pool.query(
          'INSERT INTO workplans(objective, activity, timeline, status) VALUES($1, $2, $3, $4) RETURNING *',
          [objective, activity, timeline, status]
        );

        sendJson(res, 201, { message: 'Workplan created', workplan: result.rows[0] });
      } catch (error) {
        console.error(error);
        sendJson(res, 400, { error: 'Invalid JSON or request data' });
      }
      return;
    }

    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    serveStatic(req, res, '/index.html');
    return;
  }

  const extension = path.extname(pathname);
  if (extension) {
    serveStatic(req, res, pathname);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(port, (error) => {
  if (error) {
    console.error('Something went wrong:', error);
    return;
  }
  console.log('Server is listening on port ' + port);
});