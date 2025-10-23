# Déploiement MESRIT Website

## 🚀 Déploiement Rapide

### Sur le serveur

```bash
ssh user@site.mesrit.com
cd /var/www/mesrit-website

# 1. Rebuild
pm2 stop mesrit
rm -rf .next
git pull
npm install --production
npm run build
pm2 restart mesrit

# 2. Installer Caddyfile
sudo cp /tmp/Caddyfile-CORRECTED /etc/caddy/Caddyfile
sudo caddy reload
```

### Corriger .env

```env
DISABLE_SECURITY_HEADERS=false
USE_CADDY_HEADERS=true
FRONTEND_URL=https://site.mesrit.com
BACKEND_URL=https://site.mesrit.com/api
```

### Tester

1. Vider cache navigateur (Ctrl+Shift+Delete)
2. Aller sur https://site.mesrit.com
3. Vérifier console (F12) - aucune erreur 404

---

## 📁 Fichiers Importants

- `Caddyfile-CORRECTED` → Config Caddy à utiliser
- `.env.production.corrected` → Template .env production

---

## 🔧 Commandes Utiles

```bash
pm2 status mesrit              # Status
pm2 logs mesrit                # Logs
pm2 restart mesrit             # Redémarrer
sudo caddy reload              # Recharger Caddy
```
