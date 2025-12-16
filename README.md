# MESRIT Website

Site officiel du Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation - Niger

## 🚀 Démarrage Rapide

### Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm run start
```

## 📦 Déploiement

Voir **[docs/GUIDE_DEPLOIEMENT.md](docs/GUIDE_DEPLOIEMENT.md)** pour les instructions complètes.

## 📁 Structure du Projet

```
mesrit-website/
├── src/
│   ├── components/   # Composants React (UI, Layout, etc.)
│   ├── pages/        # Routes & API Next.js
│   ├── lib/          # Utilitaires & Services
│   ├── styles/       # Styles globaux
│   └── middleware/   # Sécurité & Headers
├── public/           # Assets statiques
├── scripts/          # Scripts de maintenance & tâches planifiées
├── docs/             # Documentation
│   ├── reports/      # Rapports d'audit et historiques
│   └── env-examples/ # Exemples de configuration
└── data/             # Données JSON statiques
```

## 🔧 Configuration

- `.env` : Variables locales (ne pas commit).
- `docs/env-examples/` : Modèles pour la production.
- `Caddyfile-CORRECTED` : Configuration du serveur web Caddy.

## 🛡️ Sécurité

Ce projet a fait l'objet d'un audit de sécurité (Phase 8).
- **Rapports** : Voir `docs/reports/SECURITY-AUDIT.md` (ancien) et l'artifact `security_audit.md`.
- **Note** : Les clés API et secrets ne doivent JAMAIS être commités.

## 📝 Scripts Utiles

```bash
npm run dev         # Serveur de dev
npm run build       # Build pour prod
npm run start       # Démarrer prod
npm audit           # Vérifier les vulnérabilités
npm run crawler     # Lancer l'indexation locale
```
