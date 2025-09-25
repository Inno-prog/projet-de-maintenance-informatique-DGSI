#!/bin/bash

echo "🚀 Installation de Keycloak standalone pour Maintenance DGSI..."

# Variables
KEYCLOAK_VERSION="23.0.4"
KEYCLOAK_DIR="keycloak-${KEYCLOAK_VERSION}"
KEYCLOAK_ZIP="${KEYCLOAK_DIR}.zip"
DOWNLOAD_URL="https://github.com/keycloak/keycloak/releases/download/${KEYCLOAK_VERSION}/${KEYCLOAK_ZIP}"

# Vérifier si Keycloak est déjà installé
if [ -d "$KEYCLOAK_DIR" ]; then
    echo "✅ Keycloak est déjà installé dans $KEYCLOAK_DIR"
    exit 0
fi

# Télécharger Keycloak
echo "📥 Téléchargement de Keycloak ${KEYCLOAK_VERSION}..."
if command -v curl &> /dev/null; then
    curl -L -o "$KEYCLOAK_ZIP" "$DOWNLOAD_URL"
elif command -v wget &> /dev/null; then
    wget -O "$KEYCLOAK_ZIP" "$DOWNLOAD_URL"
else
    echo "❌ Ni curl ni wget n'est installé. Veuillez installer l'un d'eux."
    exit 1
fi

# Vérifier le téléchargement
if [ ! -f "$KEYCLOAK_ZIP" ]; then
    echo "❌ Échec du téléchargement de Keycloak"
    exit 1
fi

echo "📦 Extraction de Keycloak..."
unzip "$KEYCLOAK_ZIP"

# Nettoyer l'archive
rm "$KEYCLOAK_ZIP"

# Créer le répertoire de données
mkdir -p "$KEYCLOAK_DIR/data"

echo "✅ Keycloak installé avec succès !"
echo "📁 Répertoire : $KEYCLOAK_DIR"
echo ""
echo "🚀 Pour démarrer Keycloak, exécutez :"
echo "   cd $KEYCLOAK_DIR"
echo "   ./bin/kc.sh start-dev --import-realm"