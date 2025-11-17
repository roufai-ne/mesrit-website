#!/bin/bash

#
# setup-linux-uploads.sh
# Script de configuration des uploads pour déploiement Linux
# Crée les répertoires, configure les permissions, valide la structure
#

set -e  # Exit on error

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
UPLOADS_BASE="${UPLOADS_BASE_PATH:-.}"
PUBLIC_DIR="${UPLOADS_BASE}/public"
TEMP_DIR="${NODE_UPLOAD_TMPDIR:-/tmp/node-uploads}"
WEB_USER="${WEB_USER:-www-data}"
DIR_PERMISSIONS="0775"
FILE_PERMISSIONS="0664"

echo -e "${BLUE}=== Configuration des uploads pour Linux ===${NC}"
echo "Date: $(date)"
echo "Base: $UPLOADS_BASE"
echo "Web User: $WEB_USER"
echo ""

# 1. Vérifier que nous sommes en mode root ou utiliser sudo
if [[ $EUID -ne 0 ]]; then
  echo -e "${YELLOW}[!] Ce script doit être exécuté avec sudo${NC}"
  echo "Re-lancement avec sudo..."
  exec sudo "$0" "$@"
fi

# 2. Créer le répertoire de base s'il n'existe pas
echo -e "${BLUE}[1/6] Création du répertoire de base...${NC}"
if [ ! -d "$PUBLIC_DIR" ]; then
  mkdir -p "$PUBLIC_DIR"
  echo -e "${GREEN}✓ Créé: $PUBLIC_DIR${NC}"
else
  echo -e "${GREEN}✓ Existe déjà: $PUBLIC_DIR${NC}"
fi

# 3. Créer tous les répertoires d'upload
echo -e "${BLUE}[2/6] Création des répertoires d'upload...${NC}"

UPLOAD_DIRS=(
  "$PUBLIC_DIR/uploads"
  "$PUBLIC_DIR/uploads/images"
  "$PUBLIC_DIR/uploads/images/news"
  "$PUBLIC_DIR/uploads/images/dir"
  "$PUBLIC_DIR/uploads/images/logos"
  "$PUBLIC_DIR/uploads/videos"
  "$PUBLIC_DIR/uploads/videos/news"
  "$PUBLIC_DIR/uploads/videos/thumbnails"
  "$PUBLIC_DIR/uploads/documents"
  "$PUBLIC_DIR/map"
  "$PUBLIC_DIR/videos/news"
)

for dir in "${UPLOAD_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo -e "${GREEN}✓ Créé: $dir${NC}"
  else
    echo -e "${GREEN}✓ Existe: $dir${NC}"
  fi
done

# 4. Créer le répertoire temporaire s'il n'existe pas
echo -e "${BLUE}[3/6] Création du répertoire temporaire...${NC}"
if [ ! -d "$TEMP_DIR" ]; then
  mkdir -p "$TEMP_DIR"
  echo -e "${GREEN}✓ Créé: $TEMP_DIR${NC}"
else
  echo -e "${GREEN}✓ Existe: $TEMP_DIR${NC}"
fi

# 5. Configurer les permissions
echo -e "${BLUE}[4/6] Configuration des permissions...${NC}"

# Permissions sur le répertoire de base
chmod 755 "$PUBLIC_DIR"
echo -e "${GREEN}✓ Permissions (755): $PUBLIC_DIR${NC}"

# Permissions sur tous les répertoires d'upload
for dir in "${UPLOAD_DIRS[@]}"; do
  chmod 775 "$dir"
done
echo -e "${GREEN}✓ Permissions (775): Tous les répertoires d'upload${NC}"

# Permissions sur le répertoire temporaire
chmod 1777 "$TEMP_DIR"  # sticky bit pour /tmp
echo -e "${GREEN}✓ Permissions (1777): $TEMP_DIR${NC}"

# 6. Définir le propriétaire
echo -e "${BLUE}[5/6] Configuration du propriétaire...${NC}"

# Vérifier si l'utilisateur existe
if id "$WEB_USER" &>/dev/null; then
  chown -R "$WEB_USER:$WEB_USER" "$PUBLIC_DIR/uploads"
  chown -R "$WEB_USER:$WEB_USER" "$TEMP_DIR"
  echo -e "${GREEN}✓ Propriétaire défini à: $WEB_USER${NC}"
else
  echo -e "${YELLOW}[!] Utilisateur $WEB_USER n'existe pas${NC}"
  echo "    Les répertoires resteront avec le propriétaire actuel"
  echo "    Sur Ubuntu: sudo apt install www-data"
fi

# 7. Valider la structure
echo -e "${BLUE}[6/6] Validation de la structure...${NC}"

ERROR_COUNT=0

for dir in "${UPLOAD_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    echo -e "${RED}✗ Répertoire manquant: $dir${NC}"
    ((ERROR_COUNT++))
  elif [ ! -w "$dir" ]; then
    echo -e "${RED}✗ Répertoire non modifiable: $dir${NC}"
    ((ERROR_COUNT++))
  else
    echo -e "${GREEN}✓ OK: $dir${NC}"
  fi
done

if [ ! -d "$TEMP_DIR" ]; then
  echo -e "${RED}✗ Répertoire temp manquant: $TEMP_DIR${NC}"
  ((ERROR_COUNT++))
elif [ ! -w "$TEMP_DIR" ]; then
  echo -e "${RED}✗ Répertoire temp non modifiable: $TEMP_DIR${NC}"
  ((ERROR_COUNT++))
else
  echo -e "${GREEN}✓ OK: Répertoire temp${NC}"
fi

# Résumé final
echo ""
echo -e "${BLUE}=== Résumé ===${NC}"
if [ $ERROR_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ Configuration terminée avec succès${NC}"
  echo ""
  echo "Vérifier l'espace disque:"
  df -h "$PUBLIC_DIR" "$TEMP_DIR"
  echo ""
  echo "Vérifier les permissions:"
  ls -ld "$PUBLIC_DIR"
  echo ""
  echo "Variables d'environnement à définir dans .env.production:"
  echo "  UPLOADS_BASE_PATH=$UPLOADS_BASE"
  echo "  NODE_UPLOAD_TMPDIR=$TEMP_DIR"
  exit 0
else
  echo -e "${RED}✗ Erreurs détectées: $ERROR_COUNT${NC}"
  echo "   Vérifiez les messages ci-dessus"
  exit 1
fi
