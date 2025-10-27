#!/bin/bash

# 🚀 Script de déploiement automatique - MESRIT Website
# Usage: ./deploy.sh [--skip-deps] [--skip-build]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/mesrit-website"
APP_NAME="mesrit-website"
BRANCH="V8-reform"
LOG_FILE="/var/log/deploy-mesrit.log"

# Options
SKIP_DEPS=false
SKIP_BUILD=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-deps)
      SKIP_DEPS=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo -e "${RED}Option inconnue: $1${NC}"
      exit 1
      ;;
  esac
done

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo "[SUCCESS] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    echo "[ERROR] $1" >> "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

# Vérifications préalables
log "🔍 Vérification des prérequis..."

# Vérifier que le répertoire existe
if [ ! -d "$APP_DIR" ]; then
    error "Le répertoire $APP_DIR n'existe pas!"
    exit 1
fi

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    error "PM2 n'est pas installé. Installez-le avec: npm install -g pm2"
    exit 1
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé!"
    exit 1
fi

success "Prérequis vérifiés"

# Aller dans le répertoire de l'application
cd "$APP_DIR"

# Sauvegarder l'état actuel
log "💾 Sauvegarde de l'état actuel..."
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git branch --show-current)
log "Commit actuel: $CURRENT_COMMIT"
log "Branche actuelle: $CURRENT_BRANCH"

# Vérifier qu'il n'y a pas de modifications non commitées
if [[ -n $(git status -s) ]]; then
    warning "Il y a des modifications non commitées!"
    git status -s
    read -p "Voulez-vous continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Déploiement annulé."
        exit 1
    fi
fi

# Récupération des dernières modifications
log "📥 Récupération des dernières modifications depuis origin/$BRANCH..."
git fetch origin

# Vérifier s'il y a des mises à jour
UPDATES=$(git rev-list HEAD..origin/$BRANCH --count)
if [ "$UPDATES" -eq 0 ]; then
    success "Aucune mise à jour disponible. Le code est déjà à jour."
else
    log "🆕 $UPDATES commit(s) à déployer"
    git log HEAD..origin/$BRANCH --oneline
fi

# Pull des modifications
log "⬇️  Pull des modifications..."
if git pull origin "$BRANCH"; then
    success "Code mis à jour avec succès"
else
    error "Erreur lors du pull. Vérifiez les conflits."
    exit 1
fi

NEW_COMMIT=$(git rev-parse HEAD)

# Afficher le résumé des changements
if [ "$CURRENT_COMMIT" != "$NEW_COMMIT" ]; then
    log "📝 Résumé des changements:"
    git log --oneline "$CURRENT_COMMIT".."$NEW_COMMIT"
fi

# Installation des dépendances
if [ "$SKIP_DEPS" = false ]; then
    log "📦 Installation des dépendances..."
    if npm ci --only=production; then
        success "Dépendances installées"
    else
        error "Erreur lors de l'installation des dépendances"
        exit 1
    fi
else
    warning "Installation des dépendances ignorée (--skip-deps)"
fi

# Build de l'application
if [ "$SKIP_BUILD" = false ]; then
    log "🔨 Build de l'application Next.js..."
    if NODE_ENV=production npm run build; then
        success "Build réussi"
    else
        error "Erreur lors du build"

        # Proposer de revenir à l'ancien commit
        read -p "Voulez-vous revenir au commit précédent? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "🔙 Retour au commit précédent..."
            git reset --hard "$CURRENT_COMMIT"
            success "Code restauré au commit $CURRENT_COMMIT"
        fi
        exit 1
    fi

    # Vérifier que le dossier .next existe
    if [ ! -d ".next" ]; then
        error "Le dossier .next n'a pas été créé!"
        exit 1
    fi

    success "Dossier .next créé avec succès"
else
    warning "Build ignoré (--skip-build)"
fi

# Redémarrage de l'application avec PM2
log "🔄 Redémarrage de l'application $APP_NAME..."

# Vérifier si l'application est déjà en cours d'exécution
if pm2 list | grep -q "$APP_NAME"; then
    log "Application trouvée dans PM2, redémarrage..."
    if pm2 restart "$APP_NAME"; then
        success "Application redémarrée"
    else
        error "Erreur lors du redémarrage"
        exit 1
    fi
else
    log "Application non trouvée dans PM2, démarrage initial..."
    if pm2 start ecosystem.config.js; then
        success "Application démarrée"
    else
        error "Erreur lors du démarrage"
        exit 1
    fi
fi

# Sauvegarder la configuration PM2
pm2 save

# Attendre que l'application soit prête
log "⏳ Vérification que l'application répond..."
sleep 3

# Tester que l'application répond
MAX_ATTEMPTS=10
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f -s http://localhost:3000 > /dev/null; then
        success "Application répond correctement sur localhost:3000"
        break
    else
        ATTEMPT=$((ATTEMPT + 1))
        if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
            warning "Tentative $ATTEMPT/$MAX_ATTEMPTS - L'application ne répond pas encore..."
            sleep 2
        else
            error "L'application ne répond pas après $MAX_ATTEMPTS tentatives"
            log "Vérifiez les logs avec: pm2 logs $APP_NAME"
            exit 1
        fi
    fi
done

# Afficher le statut de PM2
log "📊 Statut de l'application:"
pm2 status "$APP_NAME"

# Afficher les logs récents
log "📋 Logs récents (20 dernières lignes):"
pm2 logs "$APP_NAME" --lines 20 --nostream

# Vider les anciens logs si trop volumineux
LOG_SIZE=$(pm2 logs "$APP_NAME" --nostream --lines 1 2>&1 | wc -l)
if [ "$LOG_SIZE" -gt 10000 ]; then
    warning "Les logs PM2 sont volumineux ($LOG_SIZE lignes)"
    read -p "Voulez-vous vider les logs? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 flush
        success "Logs vidés"
    fi
fi

# Résumé final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "🎉 Déploiement terminé avec succès!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Branche: $BRANCH"
echo "📌 Commit précédent: ${CURRENT_COMMIT:0:7}"
echo "📌 Commit actuel: ${NEW_COMMIT:0:7}"
echo "🔗 URL locale: http://localhost:3000"
echo "🌐 URL production: https://site.mesrit.com"
echo ""
echo "Commandes utiles:"
echo "  - Voir les logs: pm2 logs $APP_NAME"
echo "  - Voir le statut: pm2 status"
echo "  - Redémarrer: pm2 restart $APP_NAME"
echo "  - Arrêter: pm2 stop $APP_NAME"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Log final
log "✅ Déploiement terminé - Commit: $NEW_COMMIT"

exit 0
