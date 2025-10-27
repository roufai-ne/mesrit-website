#!/bin/bash
# ========================================
# Script de déploiement MESRIT Website
# À exécuter sur le serveur de production
# ========================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Début du déploiement MESRIT Website..."

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================
# 1. VÉRIFICATIONS PRÉ-DÉPLOIEMENT
# ========================================
echo -e "${YELLOW}📋 Étape 1/7 - Vérifications pré-déploiement${NC}"

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé. Êtes-vous dans le bon répertoire ?${NC}"
    exit 1
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Vérifications OK${NC}"

# ========================================
# 2. ARRÊT DE L'APPLICATION
# ========================================
echo -e "${YELLOW}📋 Étape 2/7 - Arrêt de l'application${NC}"

if command -v pm2 &> /dev/null; then
    pm2 stop mesrit-website || true
    echo -e "${GREEN}✓ Application arrêtée (PM2)${NC}"
elif systemctl is-active --quiet mesrit-website; then
    sudo systemctl stop mesrit-website
    echo -e "${GREEN}✓ Application arrêtée (systemd)${NC}"
else
    echo -e "${YELLOW}⚠ Aucun processus à arrêter${NC}"
fi

# ========================================
# 3. SAUVEGARDE
# ========================================
echo -e "${YELLOW}📋 Étape 3/7 - Sauvegarde${NC}"

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d ".next" ]; then
    cp -r .next "$BACKUP_DIR/"
    echo -e "${GREEN}✓ Build sauvegardé dans $BACKUP_DIR${NC}"
fi

# ========================================
# 4. MISE À JOUR DU CODE
# ========================================
echo -e "${YELLOW}📋 Étape 4/7 - Mise à jour du code${NC}"

# Si Git est disponible
if [ -d ".git" ]; then
    git pull origin master
    echo -e "${GREEN}✓ Code mis à jour depuis Git${NC}"
else
    echo -e "${YELLOW}⚠ Pas de dépôt Git, passage à l'étape suivante${NC}"
fi

# ========================================
# 5. INSTALLATION DES DÉPENDANCES
# ========================================
echo -e "${YELLOW}📋 Étape 5/7 - Installation des dépendances${NC}"

npm ci --production
echo -e "${GREEN}✓ Dépendances installées${NC}"

# ========================================
# 6. BUILD DE L'APPLICATION
# ========================================
echo -e "${YELLOW}📋 Étape 6/7 - Build de l'application${NC}"

npm run build

# Vérifier que le build a réussi
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Le build a échoué (dossier .next non créé)${NC}"

    # Restaurer le backup si disponible
    if [ -d "$BACKUP_DIR/.next" ]; then
        echo -e "${YELLOW}📦 Restauration du backup...${NC}"
        cp -r "$BACKUP_DIR/.next" .
    fi

    exit 1
fi

echo -e "${GREEN}✓ Build réussi${NC}"

# Afficher le BUILD_ID
if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo -e "${GREEN}  BUILD_ID: $BUILD_ID${NC}"
fi

# ========================================
# 7. MISE À JOUR DE CADDY
# ========================================
echo -e "${YELLOW}📋 Étape 7/7 - Mise à jour de Caddy${NC}"

if [ -f "Caddyfile-CORRECTED" ]; then
    # Sauvegarder l'ancien Caddyfile
    if [ -f "/etc/caddy/Caddyfile" ]; then
        sudo cp /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✓ Ancien Caddyfile sauvegardé${NC}"
    fi

    # Copier le nouveau Caddyfile
    sudo cp Caddyfile-CORRECTED /etc/caddy/Caddyfile
    echo -e "${GREEN}✓ Nouveau Caddyfile copié${NC}"

    # Vérifier la syntaxe
    if sudo caddy validate --config /etc/caddy/Caddyfile; then
        echo -e "${GREEN}✓ Syntaxe Caddyfile valide${NC}"

        # Recharger Caddy
        sudo systemctl reload caddy
        echo -e "${GREEN}✓ Caddy rechargé${NC}"
    else
        echo -e "${RED}❌ Erreur de syntaxe dans le Caddyfile${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Caddyfile-CORRECTED non trouvé, passage à l'étape suivante${NC}"
fi

# ========================================
# 8. REDÉMARRAGE DE L'APPLICATION
# ========================================
echo -e "${YELLOW}📋 Redémarrage de l'application${NC}"

if command -v pm2 &> /dev/null; then
    pm2 restart mesrit-website || pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✓ Application redémarrée (PM2)${NC}"
elif systemctl list-unit-files | grep -q mesrit-website; then
    sudo systemctl start mesrit-website
    echo -e "${GREEN}✓ Application redémarrée (systemd)${NC}"
else
    echo -e "${YELLOW}⚠ Démarrage manuel nécessaire${NC}"
    echo -e "  Exécutez: npm start"
fi

# ========================================
# 9. VÉRIFICATIONS POST-DÉPLOIEMENT
# ========================================
echo -e "${YELLOW}📋 Vérifications post-déploiement${NC}"

# Attendre 3 secondes que l'app démarre
sleep 3

# Vérifier que l'app répond sur localhost:3000
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Next.js répond sur localhost:3000${NC}"
else
    echo -e "${RED}❌ Next.js ne répond pas sur localhost:3000${NC}"
    echo -e "${YELLOW}   Vérifiez les logs avec: pm2 logs mesrit-website${NC}"
fi

# Vérifier que Caddy fonctionne
if systemctl is-active --quiet caddy; then
    echo -e "${GREEN}✓ Caddy fonctionne${NC}"
else
    echo -e "${RED}❌ Caddy ne fonctionne pas${NC}"
fi

# ========================================
# RÉSUMÉ
# ========================================
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "📊 Informations:"
echo -e "  • Build ID: ${BUILD_ID:-N/A}"
echo -e "  • Backup: $BACKUP_DIR"
echo ""
echo -e "🔍 Commandes utiles:"
echo -e "  • Logs Next.js:  ${YELLOW}pm2 logs mesrit-website${NC}"
echo -e "  • Logs Caddy:    ${YELLOW}sudo journalctl -u caddy -f${NC}"
echo -e "  • Status PM2:    ${YELLOW}pm2 status${NC}"
echo -e "  • Tester le site: ${YELLOW}curl -I https://site.mesrit.com${NC}"
echo ""
echo -e "🌐 Site accessible sur: ${GREEN}https://site.mesrit.com${NC}"
