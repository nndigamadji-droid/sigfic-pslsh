/**
 * SIGFIC-PSLSH — Serveur statique frontend
 * Sert le dossier /frontend sur le port 5500
 * Usage : node frontend-server.js
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = process.env.PORT || 5500;
const ROOT    = path.join(__dirname, 'frontend');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.pdf':  'application/pdf',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // ignorer query string

  // Normaliser le chemin
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Sécurité : empêcher la sortie du dossier frontend
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Accès refusé');
    return;
  }

  // Résolution du fichier cible
  let target = filePath;

  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html');
  } else if (!fs.existsSync(target) && !path.extname(target)) {
    // URL sans extension → essayer avec .html
    target = target + '.html';
  }

  if (!fs.existsSync(target)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 — Fichier introuvable : ${urlPath}`);
    return;
  }

  const ext  = path.extname(target).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────┐');
  console.log('  │   SIGFIC-PSLSH  —  Frontend statique        │');
  console.log(`  │   http://localhost:${PORT}                      │`);
  console.log('  │   Dossier servi : ./frontend                │');
  console.log('  └─────────────────────────────────────────────┘');
  console.log('');
});
