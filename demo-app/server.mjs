import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);

// Demo credentials only guard this throwaway local app, so plain defaults
// keep CI running without a .env. Keep in sync with tests/credentials.ts.
const user = process.env.ADMIN_USER ?? 'demo_admin';
const password = process.env.ADMIN_PASSWORD ?? 'demo_password';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
};

// token -> username
const sessions = new Map();

function readJson(req) {
  return new Promise((done, fail) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        done(body ? JSON.parse(body) : {});
      } catch {
        done({});
      }
    });
    req.on('error', fail);
  });
}

function sessionUser(req) {
  const token = (req.headers.cookie ?? '').match(/session=([^;]+)/)?.[1];
  return token ? sessions.get(token) : undefined;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (url.pathname === '/login' && req.method === 'POST') {
    const body = await readJson(req);
    if (body.username === user && body.password === password) {
      const token = randomUUID();
      sessions.set(token, user);
      res.writeHead(204, { 'set-cookie': `session=${token}; HttpOnly; Path=/; SameSite=Lax` });
      res.end();
    } else {
      res.writeHead(401, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid credentials' }));
    }
    return;
  }

  if (url.pathname === '/me' && req.method === 'GET') {
    const name = sessionUser(req);
    res.writeHead(name ? 200 : 401, { 'content-type': 'application/json' });
    res.end(name ? JSON.stringify({ username: name }) : JSON.stringify({ error: 'Not signed in' }));
    return;
  }

  if (url.pathname === '/logout' && req.method === 'POST') {
    const token = (req.headers.cookie ?? '').match(/session=([^;]+)/)?.[1];
    if (token) sessions.delete(token);
    res.writeHead(204, { 'set-cookie': 'session=; HttpOnly; Path=/; Max-Age=0' });
    res.end();
    return;
  }

  const target = resolve(root, url.pathname === '/' ? 'login.html' : `.${url.pathname}`);
  if (!target.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const file = await readFile(target);
    res.writeHead(200, { 'content-type': MIME[extname(target)] ?? 'application/octet-stream' });
    res.end(file);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[demo-app] listening on http://localhost:${port}`);
});
