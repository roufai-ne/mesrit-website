# MESRIT Website

Site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation - Niger

## 🚀 Démarrage Rapide

### Développement

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

### Production

```bash
npm run build
npm run start
```

## 📦 Déploiement

Voir **DEPLOIEMENT.md** pour les instructions complètes.

## 🛠️ Technologies

- Next.js 15.5.6
- React 19
- Tailwind CSS
- MongoDB
- Caddy v2

## 📁 Structure

```
mesrit-website/
├── src/
│   ├── components/    # Composants React
│   ├── pages/        # Pages Next.js & APIs
│   ├── lib/          # Utilitaires
│   └── styles/       # CSS global
├── public/           # Fichiers statiques
└── data/            # Données JSON
```

## 🔧 Configuration

- `.env` - Variables d'environnement locales
- `.env.production.corrected` - Template pour production
- `Caddyfile-CORRECTED` - Configuration Caddy

## 📝 Scripts

```bash
npm run dev        # Mode développement
npm run build      # Build production
npm run start      # Démarrer en production
npm run lint       # Linter le code
```

## 🌐 Déploiement Production

Le site est déployé avec :
- **Serveur :** Caddy v2 (reverse proxy + SSL)
- **App :** Next.js (PM2)
- **Base :** MongoDB

Voir **DEPLOIEMENT.md** pour les détails.
