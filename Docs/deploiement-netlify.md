# Deploiement Netlify - SIGFIC-PSLSH

## Frontend Netlify

- Connecter le depot Git dans Netlify.
- Base directory: racine du depot.
- Publish directory: `frontend`.
- Build command: vide.
- Le fichier `netlify.toml` contient deja cette configuration.

## Backend API

Le backend Node/Express ne doit pas etre heberge sur GitHub Pages ou comme simple site statique.
Le deployer sur une plateforme Node.js avec stockage persistant et base de donnees adaptee
(`PostgreSQL` ou `MySQL` recommande en production).

## Backend Render

Le fichier `render.yaml` prepare un Blueprint Render avec:

- service web Node.js `sigfic-pslsh-backend`;
- racine `backend`;
- commande de build `npm install`;
- commande de demarrage `npm run seed && npm start`;
- base PostgreSQL managée `sigfic-pslsh-db`;
- injection automatique de `DATABASE_URL`;
- `FRONTEND_URL=https://sigfic-pslsh.netlify.app`.

Apres creation du service Render, recuperer son URL publique, par exemple
`https://sigfic-pslsh-backend.onrender.com`, puis activer le proxy Netlify
dans `netlify.toml`.

Attention: les pieces jointes stockees dans `storage/uploads` necessitent un
stockage persistant ou externe pour une production institutionnelle.

Le seed cree l'utilisateur initial `admin@pslsh.org / Admin@2026`. Changer ce
mot de passe immediatement apres la premiere connexion.

Variables minimales cote backend:

- `NODE_ENV=production`
- `JWT_SECRET`
- `FRONTEND_URL=https://votre-site.netlify.app`
- `PORT`
- `UPLOAD_PATH`

Voir `backend/.env.example`.

## Connexion frontend -> backend

Par defaut:

- en local, le frontend appelle `http://localhost:3000/api/v1`;
- en production, le frontend appelle `/api/v1` sur le meme domaine.

Apres deploiement du backend, activer le proxy dans `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://votre-backend.example.com/api/:splat"
  status = 200
  force = true
```

Cette approche evite les URL `localhost` en production et limite les problemes CORS.
