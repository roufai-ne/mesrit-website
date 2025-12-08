#!/bin/bash

# Script d'optimisation des images pour MESRIT
# Convertit toutes les images JPG/PNG en WebP et AVIF
# Sauvegarde les originaux dans un dossier backup

set -e

echo "🖼️  Script d'Optimisation des Images MESRIT"
echo "============================================="
echo ""

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si squoosh-cli est installé
if ! command -v npx @squoosh/cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  @squoosh/cli n'est pas installé.${NC}"
    echo "Installation en cours..."
    npm install -g @squoosh/cli
fi

# Créer le dossier de backup
BACKUP_DIR="public/images-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}✓ Dossier de backup créé: $BACKUP_DIR${NC}"
echo ""

# Fonction pour convertir les images
convert_images() {
    local format=$1
    local quality=$2
    local extension=$3

    echo "🔄 Conversion en $format (qualité: $quality%)..."

    # Compter le nombre d'images
    count=$(find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l)
    echo "   Nombre d'images à convertir: $count"

    # Sauvegarder les originaux
    echo "   Sauvegarde des originaux..."
    cp -r public/images/* "$BACKUP_DIR/"

    # Convertir les JPG
    echo "   Conversion des JPG..."
    find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" \) -print0 | while IFS= read -r -d '' file; do
        npx @squoosh/cli --$format "{\"quality\":$quality}" "$file" &
    done
    wait

    # Convertir les PNG
    echo "   Conversion des PNG..."
    find public/images -type f -name "*.png" -print0 | while IFS= read -r -d '' file; do
        npx @squoosh/cli --$format "{\"quality\":$quality}" "$file" &
    done
    wait

    echo -e "${GREEN}✓ Conversion en $format terminée${NC}"
}

# Menu principal
echo "Choisissez le format de conversion:"
echo "1. WebP uniquement (recommandé, support universel)"
echo "2. AVIF uniquement (meilleure compression, support limité)"
echo "3. WebP + AVIF (meilleur compromis, taille doublée)"
echo "4. Annuler"
echo ""
read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo ""
        convert_images "webp" 80 "webp"
        ;;
    2)
        echo ""
        convert_images "avif" 60 "avif"
        ;;
    3)
        echo ""
        convert_images "webp" 80 "webp"
        convert_images "avif" 60 "avif"
        ;;
    4)
        echo -e "${YELLOW}Opération annulée.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Choix invalide.${NC}"
        exit 1
        ;;
esac

# Calculer l'espace économisé
echo ""
echo "📊 Calcul de l'espace économisé..."
original_size=$(du -sh "$BACKUP_DIR" | cut -f1)
new_size=$(du -sh public/images | cut -f1)

echo ""
echo "================================"
echo -e "${GREEN}✅ OPTIMISATION TERMINÉE${NC}"
echo "================================"
echo "Taille originale: $original_size"
echo "Nouvelle taille:  $new_size"
echo "Backup sauvegardé dans: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Testez votre site pour vérifier que toutes les images s'affichent"
echo "2. Vérifiez les performances avec Lighthouse"
echo "3. Si tout fonctionne, vous pouvez supprimer le backup:"
echo "   rm -rf $BACKUP_DIR"
echo ""
echo -e "${GREEN}🎉 Améliorations estimées:${NC}"
echo "   - Réduction poids: 60-70%"
echo "   - Amélioration LCP: +40%"
echo "   - Économie bande passante: ~30-50 MB"
echo ""
