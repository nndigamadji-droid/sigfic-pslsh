const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── Sécurité ──────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

function parseOrigins(value) {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// CORS : autorise le frontend servi sur 5500 (dev) et les URLs de production
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  process.env.FRONTEND_URL,
  ...parseOrigins(process.env.FRONTEND_URLS),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Autoriser les requêtes sans origin (curl, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS bloqué pour l'origine : ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Trop de requêtes' });
app.use('/api/', limiter);

// ─── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Fichiers uploadés et exportés (accès cross-origin depuis le frontend) ─────
app.use('/uploads', express.static(path.join(__dirname, '../../storage/uploads')));
app.use('/exports', express.static(path.join(__dirname, '../../storage/exports')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', require('../routes/index'));

// ─── Route racine : confirmation que c'est bien une API ──────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'SIGFIC-PSLSH API',
    version: '2.0',
    status: 'running',
    frontend: process.env.FRONTEND_URL || 'http://localhost:5500',
    docs: '/api/v1',
  });
});

// ─── 404 pour toute route inconnue ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.path}` });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(require('../middleware/error.middleware'));

module.exports = app;
