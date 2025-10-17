# 🚀 Guide de Déploiement - MESRIT Website

Guide simple et pratique pour déployer l'application MESRIT en production.

## 📋 Prérequis

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Node.js 20+ LTS
- MongoDB 5.0+
- Accès sudo/root
- Nom de domaine (optionnel)

## ⚡ Installation Rapide

### 1. Préparation du Serveur

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installation MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update && sudo apt install -y mongodb-org

# Démarrage MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Installation Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Outils utiles
sudo apt install -y git curl wget htop
```

### 2. Configuration Base de Données

```bash
# Connexion MongoDB
mongosh

# Création utilisateur (dans mongosh)
use admin
db.createUser({
  user: "mesrit_admin",
  pwd: "VOTRE_MOT_DE_PASSE_FORT",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Création base de données application
use mesrit_db
db.createUser({
  user: "mesrit_app",
  pwd: "VOTRE_MOT_DE_PASSE_APP",
  roles: ["readWrite"]
})
exit
```

### 3. Déploiement Application

```bash
# Clonage du projet
cd /var/www
sudo git clone https://github.com/votre-repo/mesrit-website.git
sudo chown -R $USER:$USER mesrit-website
cd mesrit-website

# Installation dépendances
npm install --production

# Configuration environnement
cp .env.example .env
nano .env
```

### 4. Configuration Environnement (.env)

```env
# Base de données
MONGODB_URI=mongodb://mesrit_app:VOTRE_MOT_DE_PASSE_APP@localhost:27017/mesrit_db

# Sécurité
NEXTAUTH_SECRET=VOTRE_SECRET_JWT_TRES_LONG_ET_COMPLEXE
NEXTAUTH_URL=http://votre-domaine.com

# Application
NODE_ENV=production
PORT=3000

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# Uploads
UPLOAD_DIR=/var/www/mesrit-website/public/uploads
MAX_FILE_SIZE=10485760
```

### 5. Build et Test

```bash
# Build de production
npm run build

# Test démarrage
npm start

# Vérification (dans un autre terminal)
curl http://localhost:3000
```

### 6. Configuration Service Systemd

```bash
# Création service
sudo nano /etc/systemd/system/mesrit.service
```

```ini
[Unit]
Description=MESRIT Website
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mesrit-website
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Activation service
sudo systemctl daemon-reload
sudo systemctl enable mesrit
sudo systemctl start mesrit
sudo systemctl status mesrit
```

### 7. Configuration Caddy (Reverse Proxy + SSL automatique)

```bash
# Configuration Caddy
sudo nano /etc/caddy/Caddyfile
```

```caddy
votre-domaine.com, www.votre-domaine.com {
    reverse_proxy localhost:3000

    # Compression automatique
    encode gzip

    # Assets statiques avec cache optimisé
    handle_path /_next/static/* {
        root * /var/www/mesrit-website/.next/static
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
    }

    handle_path /uploads/* {
        root * /var/www/mesrit-website/public/uploads
        file_server
        header Cache-Control "public, max-age=2592000"
    }

    # Logs d'accès
    log {
        output file /var/log/caddy/mesrit.log
        format json
    }
}
```

```bash
# Démarrage et activation de Caddy
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy

# Test de la configuration
sudo caddy validate --config /etc/caddy/Caddyfile
```

### 8. SSL Automatique avec Caddy

**🎉 Aucune configuration supplémentaire nécessaire !**

Caddy génère et renouvelle automatiquement les certificats SSL Let's Encrypt pour vos domaines.

```bash
# Vérifier les certificats SSL
sudo caddy list-certificates

# Forcer le renouvellement (si nécessaire)
sudo systemctl reload caddy

# Vérifier SSL en ligne
curl -I https://votre-domaine.com
```

## 🔧 Configuration Avancée

### Sauvegardes MongoDB

```bash
# Script de sauvegarde
sudo nano /usr/local/bin/backup-mesrit.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/mesrit"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --uri="mongodb://mesrit_app:VOTRE_MOT_DE_PASSE_APP@localhost:27017/mesrit_db" --out=$BACKUP_DIR/$DATE

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Exécution automatique (crontab)
chmod +x /usr/local/bin/backup-mesrit.sh
sudo crontab -e
# Ajouter : 0 2 * * * /usr/local/bin/backup-mesrit.sh
```

### Monitoring avec PM2 (Alternative)

```bash
# Installation PM2
npm install -g pm2

# Configuration PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Monitoring
pm2 monit
pm2 logs
```

## 🚨 Sécurité

### Firewall

```bash
# Configuration UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### MongoDB Sécurisé

```bash
# Édition configuration MongoDB
sudo nano /etc/mongod.conf
```

```yaml
# Ajouter/modifier :
security:
  authorization: enabled
net:
  bindIp: 127.0.0.1
  port: 27017
```

```bash
sudo systemctl restart mongod
```

## 📊 Maintenance

### Commandes Utiles

```bash
# Status services
sudo systemctl status mesrit caddy mongod

# Logs application
sudo journalctl -u mesrit -f

# Logs Caddy
sudo tail -f /var/log/caddy/mesrit.log

# Mise à jour application
cd /var/www/mesrit-website
git pull origin main
npm install --production
npm run build
sudo systemctl restart mesrit

# Vérification base de données
mongosh -u mesrit_app -p --authenticationDatabase mesrit_db
```

### Surveillance

```bash
# Monitoring ressources
htop
df -h
free -h

# Monitoring MongoDB
mongosh -u mesrit_app -p --eval "db.stats()"
```

## 🆘 Résolution de Problèmes

### Application ne démarre pas

1. Vérifier les logs : `sudo journalctl -u mesrit -n 50`
2. Vérifier configuration : `cat /var/www/mesrit-website/.env`
3. Vérifier MongoDB : `sudo systemctl status mongod`
4. Vérifier ports : `sudo netstat -tlnp | grep :3000`

### Base de données inaccessible

1. Vérifier MongoDB : `sudo systemctl status mongod`
2. Tester connexion : `mongosh -u mesrit_app -p`
3. Vérifier configuration : `cat /etc/mongod.conf`

### Performance lente

1. Vérifier ressources : `htop`, `free -h`, `df -h`
2. Optimiser MongoDB : Créer des indexes
3. Vérifier logs Caddy : `tail -f /var/log/caddy/mesrit.log`

---

## 📞 Support

- Documentation : [Lien vers votre wiki]
- Issues : [Lien vers GitHub Issues]
- Contact : admin@mesrit.ne

---

**✨ Votre application MESRIT est maintenant en production !**