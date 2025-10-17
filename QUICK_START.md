# ⚡ Démarrage Rapide - MESRIT Website

Guide express pour lancer l'application en développement.

## 🚀 Installation (5 minutes)

### 1. Prérequis
- Node.js 20+ LTS
- MongoDB 5.0+ (local ou cloud)
- Git

### 2. Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/mesrit-website.git
cd mesrit-website

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
```

### 3. Configuration (.env)

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/mesrit_dev

# Sécurité
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
PORT=3000
```

### 4. Lancement

```bash
# Démarrer MongoDB (si local)
sudo systemctl start mongod

# Initialiser la base de données
npm run setup

# Lancer en développement
npm run dev
```

### 5. Accès

- **Application** : http://localhost:3000
- **Admin** : http://localhost:3000/admin
- **Login par défaut** : admin@mesrit.ne / admin123

## 📁 Structure du Projet

```
mesrit-website/
├── src/
│   ├── components/        # Composants React
│   ├── pages/            # Pages Next.js
│   ├── lib/              # Utilitaires et services
│   ├── models/           # Modèles MongoDB
│   ├── hooks/            # Hooks personnalisés
│   └── styles/           # Styles CSS/SCSS
├── public/               # Assets statiques
├── scripts/              # Scripts de maintenance
└── docs/                # Documentation
```

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev                 # Serveur de développement
npm run dev:network        # Accessible sur le réseau local

# Build
npm run build              # Build de production
npm run start              # Démarrer en production

# Tests et qualité
npm run lint               # Vérification ESLint
npm run test               # Tests Jest
npm run test:watch         # Tests en mode watch

# Base de données
npm run migrate:v2         # Migration V2
npm run setup:v2           # Configuration complète V2

# Maintenance
npm run maintenance:v2     # Maintenance automatisée
npm run optimize:v2        # Optimisation performance
```

## 🔧 Fonctionnalités Principales

- ✅ **Système d'actualités** avec analytics V2
- ✅ **Gestion d'utilisateurs** avec RBAC
- ✅ **Interface d'administration** complète
- ✅ **Upload d'images et vidéos**
- ✅ **Newsletter automatisée**
- ✅ **SEO optimisé**
- ✅ **Mode sombre/clair**
- ✅ **Responsive design**

## 🐛 Résolution Rapide

### Base de données non connectée
```bash
# Vérifier MongoDB
sudo systemctl status mongod
mongosh  # Test connexion
```

### Port 3000 occupé
```bash
# Changer le port
echo "PORT=3001" >> .env
npm run dev
```

### Erreurs de build
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

### Permissions fichiers
```bash
# Corriger permissions uploads
chmod 755 public/uploads
```

---

**🎉 Prêt à développer ! L'application est accessible sur http://localhost:3000**