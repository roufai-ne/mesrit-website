#!/bin/bash

# 🏥 Script de vérification de santé - MESRIT Website
# Vérifie l'état de tous les composants du système

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="mesrit-website"
APP_DIR="/var/www/mesrit-website"
DOMAIN="site.mesrit.com"
PORT=3000

# Compteurs
PASSED=0
FAILED=0
WARNINGS=0

# Fonctions
check_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    PASSED=$((PASSED + 1))
}

check_failed() {
    echo -e "${RED}❌ $1${NC}"
    FAILED=$((FAILED + 1))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

section_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Début du script
clear
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║      🏥 HEALTH CHECK - MESRIT WEBSITE            ║"
echo "║      $(date +'%Y-%m-%d %H:%M:%S')                      ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# 1. VÉRIFICATIONS SYSTÈME
# ============================================
section_header "1️⃣  SYSTÈME"

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_passed "Node.js installé ($NODE_VERSION)"
else
    check_failed "Node.js non installé"
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_passed "npm installé ($NPM_VERSION)"
else
    check_failed "npm non installé"
fi

# Vérifier PM2
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    check_passed "PM2 installé ($PM2_VERSION)"
else
    check_failed "PM2 non installé"
fi

# Vérifier Caddy
if command -v caddy &> /dev/null; then
    CADDY_VERSION=$(caddy version 2>&1 | head -n 1)
    check_passed "Caddy installé ($CADDY_VERSION)"
else
    check_failed "Caddy non installé"
fi

# Vérifier l'espace disque
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_passed "Espace disque: ${DISK_USAGE}% utilisé"
elif [ "$DISK_USAGE" -lt 90 ]; then
    check_warning "Espace disque: ${DISK_USAGE}% utilisé (attention)"
else
    check_failed "Espace disque: ${DISK_USAGE}% utilisé (critique!)"
fi

# Vérifier la RAM
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    check_passed "Mémoire: ${MEMORY_USAGE}% utilisée"
elif [ "$MEMORY_USAGE" -lt 90 ]; then
    check_warning "Mémoire: ${MEMORY_USAGE}% utilisée (attention)"
else
    check_failed "Mémoire: ${MEMORY_USAGE}% utilisée (critique!)"
fi

# ============================================
# 2. VÉRIFICATIONS APPLICATION
# ============================================
section_header "2️⃣  APPLICATION"

# Vérifier le répertoire
if [ -d "$APP_DIR" ]; then
    check_passed "Répertoire application existe ($APP_DIR)"
else
    check_failed "Répertoire application manquant ($APP_DIR)"
fi

# Vérifier .env
if [ -f "$APP_DIR/.env" ]; then
    check_passed "Fichier .env présent"
else
    check_failed "Fichier .env manquant"
fi

# Vérifier node_modules
if [ -d "$APP_DIR/node_modules" ]; then
    check_passed "node_modules présent"
else
    check_failed "node_modules manquant (exécuter: npm ci)"
fi

# Vérifier .next (build)
if [ -d "$APP_DIR/.next" ]; then
    check_passed "Build Next.js présent (.next/)"
else
    check_failed "Build Next.js manquant (exécuter: npm run build)"
fi

# Vérifier ecosystem.config.js
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    check_passed "Configuration PM2 présente"
else
    check_failed "ecosystem.config.js manquant"
fi

# ============================================
# 3. VÉRIFICATIONS PM2
# ============================================
section_header "3️⃣  PM2 & NEXT.JS"

# Vérifier si PM2 tourne
if pm2 list | grep -q "$APP_NAME"; then
    PM2_STATUS=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "unknown")

    if [ "$PM2_STATUS" = "online" ]; then
        check_passed "Application PM2 en ligne (status: online)"
    else
        check_failed "Application PM2 non online (status: $PM2_STATUS)"
    fi

    # Vérifier les restarts
    RESTARTS=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.restart_time" 2>/dev/null || echo "0")
    if [ "$RESTARTS" -lt 5 ]; then
        check_passed "Restarts PM2: $RESTARTS (stable)"
    elif [ "$RESTARTS" -lt 10 ]; then
        check_warning "Restarts PM2: $RESTARTS (attention)"
    else
        check_failed "Restarts PM2: $RESTARTS (trop élevé!)"
    fi

    # Vérifier la mémoire de l'app
    APP_MEMORY=$(pm2 jlist | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.memory" 2>/dev/null || echo "0")
    APP_MEMORY_MB=$((APP_MEMORY / 1024 / 1024))
    if [ "$APP_MEMORY_MB" -lt 800 ]; then
        check_passed "Mémoire application: ${APP_MEMORY_MB}MB"
    elif [ "$APP_MEMORY_MB" -lt 1000 ]; then
        check_warning "Mémoire application: ${APP_MEMORY_MB}MB (attention)"
    else
        check_failed "Mémoire application: ${APP_MEMORY_MB}MB (trop élevé!)"
    fi
else
    check_failed "Application non trouvée dans PM2"
fi

# Tester localhost:3000
if curl -f -s http://localhost:$PORT > /dev/null; then
    check_passed "Next.js répond sur localhost:$PORT"
else
    check_failed "Next.js ne répond pas sur localhost:$PORT"
fi

# ============================================
# 4. VÉRIFICATIONS CADDY
# ============================================
section_header "4️⃣  CADDY"

# Vérifier le service Caddy
if systemctl is-active --quiet caddy; then
    check_passed "Service Caddy actif"
else
    check_failed "Service Caddy inactif"
fi

# Vérifier le Caddyfile
if [ -f "/etc/caddy/Caddyfile" ]; then
    check_passed "Caddyfile présent"

    # Valider la syntaxe
    if caddy validate --config /etc/caddy/Caddyfile &> /dev/null; then
        check_passed "Syntaxe Caddyfile valide"
    else
        check_failed "Erreur de syntaxe dans Caddyfile"
    fi
else
    check_failed "Caddyfile manquant"
fi

# Vérifier les logs Caddy
CADDY_ERRORS=$(journalctl -u caddy --since "5 minutes ago" | grep -i error | wc -l)
if [ "$CADDY_ERRORS" -eq 0 ]; then
    check_passed "Pas d'erreurs Caddy (5 dernières minutes)"
elif [ "$CADDY_ERRORS" -lt 5 ]; then
    check_warning "Quelques erreurs Caddy: $CADDY_ERRORS"
else
    check_failed "Nombreuses erreurs Caddy: $CADDY_ERRORS"
fi

# ============================================
# 5. VÉRIFICATIONS RÉSEAU
# ============================================
section_header "5️⃣  RÉSEAU & DOMAINE"

# Tester le domaine (HTTPS)
if curl -f -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    check_passed "Domaine accessible: https://$DOMAIN"
else
    check_failed "Domaine non accessible: https://$DOMAIN"
fi

# Vérifier le SSL
SSL_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$SSL_EXPIRY" ]; then
    check_passed "Certificat SSL valide (expire: $SSL_EXPIRY)"
else
    check_warning "Impossible de vérifier le certificat SSL"
fi

# Vérifier les headers de sécurité
CSP_HEADER=$(curl -s -I https://$DOMAIN 2>/dev/null | grep -i "content-security-policy" | wc -l)
if [ "$CSP_HEADER" -eq 1 ]; then
    check_passed "Header CSP présent (unique)"
elif [ "$CSP_HEADER" -gt 1 ]; then
    check_warning "Headers CSP multiples détectés ($CSP_HEADER)"
else
    check_failed "Header CSP manquant"
fi

# ============================================
# 6. VÉRIFICATIONS MONGODB
# ============================================
section_header "6️⃣  MONGODB"

# Vérifier la variable MONGODB_URI
if [ -f "$APP_DIR/.env" ]; then
    if grep -q "MONGODB_URI" "$APP_DIR/.env"; then
        check_passed "Variable MONGODB_URI définie"

        # Extraire l'URI (masquer le mot de passe)
        MONGODB_URI=$(grep "MONGODB_URI" "$APP_DIR/.env" | cut -d= -f2-)
        MONGODB_TYPE=$(echo "$MONGODB_URI" | grep -q "mongodb+srv" && echo "Atlas" || echo "Local")
        check_passed "Type MongoDB: $MONGODB_TYPE"
    else
        check_failed "Variable MONGODB_URI manquante dans .env"
    fi
fi

# Vérifier MongoDB local (si applicable)
if systemctl list-units --type=service | grep -q "mongod"; then
    if systemctl is-active --quiet mongod; then
        check_passed "Service MongoDB local actif"
    else
        check_warning "Service MongoDB local existe mais inactif"
    fi
fi

# ============================================
# 7. LOGS RÉCENTS
# ============================================
section_header "7️⃣  LOGS RÉCENTS"

echo "📊 Dernières erreurs PM2 (si présentes):"
pm2 logs "$APP_NAME" --err --lines 5 --nostream 2>&1 | tail -n 5

echo ""
echo "📊 Dernières erreurs Caddy (si présentes):"
journalctl -u caddy --since "5 minutes ago" | grep -i error | tail -n 5 || echo "Aucune erreur récente"

# ============================================
# RÉSUMÉ FINAL
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RÉSUMÉ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Vérifications réussies: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Avertissements: $WARNINGS${NC}"
echo -e "${RED}❌ Vérifications échouées: $FAILED${NC}"
echo ""

# Statut global
if [ "$FAILED" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}🎉 Système en parfaite santé!${NC}"
    EXIT_CODE=0
elif [ "$FAILED" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Système fonctionnel avec avertissements${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}🚨 Problèmes détectés - action requise!${NC}"
    EXIT_CODE=2
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Actions recommandées
if [ "$FAILED" -gt 0 ]; then
    echo "🔧 Actions recommandées:"
    echo ""
    echo "  • Voir les logs détaillés:"
    echo "    pm2 logs $APP_NAME --lines 50"
    echo "    journalctl -u caddy --lines 50"
    echo ""
    echo "  • Redémarrer les services si nécessaire:"
    echo "    pm2 restart $APP_NAME"
    echo "    systemctl restart caddy"
    echo ""
    echo "  • Consulter le guide de troubleshooting:"
    echo "    cat $APP_DIR/GUIDE-DEPLOIEMENT-COMPLET.md"
    echo ""
fi

exit $EXIT_CODE
