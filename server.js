const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

function serveFile(res, filePath, status = 200) {
  const ext = path.extname(filePath) || '.html';
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Internal Server Error');
    }

    res.writeHead(status, { 'Content-Type': contentType });
    res.end(data);
  });
}

function renderResponse(res, title, message) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="auth-page">
    <section class="auth-card">
      <h1>${title}</h1>
      <p>${message}</p>
      <a class="button button-secondary" href="/">Return to Home</a>
    </section>
  </main>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'GET') {
    if (pathname === '/') {
      return serveFile(res, path.join(__dirname, 'index.html'));
    }

    if (pathname === '/login') {
      return serveFile(res, path.join(__dirname, 'login.html'));
    }

    if (pathname === '/signup') {
      return serveFile(res, path.join(__dirname, 'signup.html'));
    }

    if (pathname === '/contact') {
      return serveFile(res, path.join(__dirname, 'contact.html'));
    }

    if (pathname === '/styles.css') {
      return serveFile(res, path.join(__dirname, 'styles.css'));
    }

    return serveFile(res, path.join(__dirname, 'index.html'), 404);
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      const parsed = querystring.parse(body);

      if (pathname === '/login') {
        const email = parsed.email || 'Unknown email';
        renderResponse(res, 'Login Successful', `Welcome back! We received your login request for <strong>${email}</strong>.`);
        return;
      }

      if (pathname === '/signup') {
        const name = parsed.name || 'New user';
        const email = parsed.email || 'Unknown email';
        renderResponse(res, 'Signup Successful', `Thanks for signing up, <strong>${name}</strong>! We sent a confirmation message to <strong>${email}</strong>.`);
        return;
      }

      if (pathname === '/contact') {
        const email = parsed.email || 'Unknown email';
        const message = parsed.message || 'No message provided.';
        renderResponse(res, 'Contact Submitted', `Thanks for reaching out! We received your message from <strong>${email}</strong>. <br><br><strong>Message:</strong> ${message}`);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method not allowed');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
